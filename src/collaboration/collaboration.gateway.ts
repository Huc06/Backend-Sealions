import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SharingService } from '../sharing/sharing.service';
import { Permission } from '../sharing/dto/share-page.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private readonly activeUsers = new Map<string, Set<string>>(); // pageId -> Set of userIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private sharingService: SharingService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      // Verify token and extract user info
      // For Supabase tokens, we need to verify with Supabase API
      const user = await this.verifyToken(token);
      if (!user) {
        this.logger.warn('Invalid token, disconnecting client');
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.email = user.email;
      this.logger.log(`Client connected: ${user.email} (${user.id})`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.log(`Client disconnected: ${client.email} (${client.userId})`);
      // Remove user from all active pages
      this.activeUsers.forEach((users, pageId) => {
        users.delete(client.userId!);
        if (users.size === 0) {
          this.activeUsers.delete(pageId);
        } else {
          // Notify others that user left
          this.server.to(`page:${pageId}`).emit('user-left', {
            userId: client.userId,
            email: client.email,
          });
        }
      });
    }
  }

  @SubscribeMessage('join-page')
  async handleJoinPage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { pageId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const { pageId } = data;

    // Check if user has VIEW permission
    const hasAccess = await this.sharingService.checkPermission(
      pageId,
      client.userId,
      Permission.VIEW,
    );

    if (!hasAccess) {
      return { error: 'Access denied' };
    }

    // Join room for this page
    await client.join(`page:${pageId}`);

    // Track active user
    if (!this.activeUsers.has(pageId)) {
      this.activeUsers.set(pageId, new Set());
    }
    this.activeUsers.get(pageId)!.add(client.userId);

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: client.userId },
      select: { id: true, email: true, name: true, avatar: true },
    });

    // Notify others that user joined
    this.server.to(`page:${pageId}`).emit('user-joined', {
      userId: client.userId,
      user,
    });

    // Send list of active users to the new user
    const activeUserIds = Array.from(this.activeUsers.get(pageId) || []);
    const activeUsers = await this.prisma.user.findMany({
      where: { id: { in: activeUserIds } },
      select: { id: true, email: true, name: true, avatar: true },
    });

    return {
      success: true,
      pageId,
      activeUsers,
    };
  }

  @SubscribeMessage('leave-page')
  async handleLeavePage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { pageId: string },
  ) {
    if (!client.userId) return { error: 'Unauthorized' };

    const { pageId } = data;
    await client.leave(`page:${pageId}`);

    // Remove from active users
    const users = this.activeUsers.get(pageId);
    if (users) {
      users.delete(client.userId);
      if (users.size === 0) {
        this.activeUsers.delete(pageId);
      }
    }

    // Notify others
    this.server.to(`page:${pageId}`).emit('user-left', {
      userId: client.userId,
      email: client.email,
    });

    return { success: true };
  }

  @SubscribeMessage('block-update')
  async handleBlockUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { pageId: string; blockId: string; content: any },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const { pageId, blockId, content } = data;

    // Check if user has EDIT permission
    const hasEditPermission = await this.sharingService.checkPermission(
      pageId,
      client.userId,
      Permission.EDIT,
    );

    if (!hasEditPermission) {
      return { error: 'No permission to edit' };
    }

    // Broadcast update to other users in the same page (excluding sender)
    client.to(`page:${pageId}`).emit('block-updated', {
      blockId,
      content,
      updatedBy: {
        userId: client.userId,
        email: client.email,
      },
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  @SubscribeMessage('cursor-position')
  async handleCursorPosition(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { pageId: string; blockId: string; position: number },
  ) {
    if (!client.userId) return { error: 'Unauthorized' };

    const { pageId, blockId, position } = data;

    // Broadcast cursor position to other users
    client.to(`page:${pageId}`).emit('cursor-moved', {
      userId: client.userId,
      email: client.email,
      blockId,
      position,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Verify Supabase JWT token
   */
  private async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      // For Supabase tokens, we can decode and verify
      // In production, you should verify with Supabase API
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
      const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

      const supabase = createClient(supabaseUrl, supabaseKey);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
      };
    } catch (error) {
      this.logger.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Emit block update event (called from service)
   */
  emitBlockUpdate(pageId: string, blockId: string, content: any, userId: string) {
    this.server.to(`page:${pageId}`).emit('block-updated', {
      blockId,
      content,
      updatedBy: { userId },
      timestamp: new Date().toISOString(),
    });
  }
}

