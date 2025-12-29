import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PasswordReminderStatus {
  needsReminder: boolean;
  daysSinceChange: number;
  daysUntilExpiry: number;
  reminderLevel: 'none' | 'warning' | 'critical';
  message: string;
}

@Injectable()
export class PasswordReminderService {
  // Password should be changed every 90 days (3 months)
  private readonly PASSWORD_EXPIRY_DAYS = 90;
  // Start warning at 60 days (2 months)
  private readonly WARNING_DAYS = 60;
  // Critical warning at 80 days
  private readonly CRITICAL_DAYS = 80;
  // Don't send reminder more than once per week
  private readonly REMINDER_COOLDOWN_DAYS = 7;

  constructor(private prisma: PrismaService) {}

  /**
   * Check if user needs password reminder
   */
  async checkReminderStatus(userId: string): Promise<PasswordReminderStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordChangedAt: true,
        passwordReminderSentAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use passwordChangedAt or createdAt (if password never changed)
    const lastChangeDate = user.passwordChangedAt || user.createdAt;
    const daysSinceChange = Math.floor(
      (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysUntilExpiry = this.PASSWORD_EXPIRY_DAYS - daysSinceChange;
    const needsReminder = daysSinceChange >= this.WARNING_DAYS;

    // Determine reminder level
    let reminderLevel: 'none' | 'warning' | 'critical' = 'none';
    let message = '';

    if (daysSinceChange >= this.CRITICAL_DAYS) {
      reminderLevel = 'critical';
      message = `⚠️ CRITICAL: Your password is ${daysSinceChange} days old. Please change it immediately for security.`;
    } else if (daysSinceChange >= this.WARNING_DAYS) {
      reminderLevel = 'warning';
      message = `🔒 Your password is ${daysSinceChange} days old. Consider changing it soon (recommended every 90 days).`;
    } else {
      message = `✅ Your password was changed ${daysSinceChange} days ago.`;
    }

    // Check if we should send reminder (cooldown period)
    const shouldSendReminder =
      needsReminder &&
      (!user.passwordReminderSentAt ||
        this.daysSince(user.passwordReminderSentAt) >=
          this.REMINDER_COOLDOWN_DAYS);

    return {
      needsReminder: shouldSendReminder,
      daysSinceChange,
      daysUntilExpiry,
      reminderLevel,
      message,
    };
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordReminderSentAt: new Date(),
      },
    });
  }

  /**
   * Update password changed date (call this when user changes password)
   */
  async updatePasswordChangedDate(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordChangedAt: new Date(),
        passwordReminderSentAt: null, // Reset reminder
      },
    });
  }

  /**
   * Get all users who need password reminder
   */
  async getUsersNeedingReminder(): Promise<string[]> {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - this.WARNING_DAYS);

    const cooldownDate = new Date();
    cooldownDate.setDate(
      cooldownDate.getDate() - this.REMINDER_COOLDOWN_DAYS,
    );

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                passwordChangedAt: {
                  lte: warningDate,
                },
              },
              {
                AND: [
                  { passwordChangedAt: null },
                  {
                    createdAt: {
                      lte: warningDate,
                    },
                  },
                ],
              },
            ],
          },
          {
            OR: [
              { passwordReminderSentAt: null },
              {
                passwordReminderSentAt: {
                  lte: cooldownDate,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return users.map((u) => u.id);
  }

  private daysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}

