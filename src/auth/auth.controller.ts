import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUser(@Request() req) {
    try {
      // req.user is already validated by Supabase strategy
      // Sync with our database
      const user = await this.authService.syncUser({
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata || {},
      });
      return { user };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }
}

/**
 * Authentication is handled by Supabase on the client side.
 * 
 * Client usage example:
 * 
 * // Sign up
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 * 
 * // Sign in
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 * 
 * // Get session token
 * const { data: { session } } = await supabase.auth.getSession()
 * const token = session.access_token
 * 
 * // Use token in API requests
 * fetch('http://localhost:3000/auth/me', {
 *   headers: {
 *     'Authorization': `Bearer ${token}`
 *   }
 * })
 */

