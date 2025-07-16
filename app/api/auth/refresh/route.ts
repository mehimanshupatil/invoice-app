import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokenPair, setAuthCookies, extractRefreshTokenFromRequest } from '@/lib/auth/jwt';
import { UserModel } from '@/lib/models/User';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = extractRefreshTokenFromRequest(request);

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No refresh token',
          message: 'Refresh token is required'
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired'
        },
        { status: 401 }
      );
    }

    // Get current user data (in case role changed)
    const user = await UserModel.getById(payload.userId);
    
    if (!user || !user.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found or inactive',
          message: 'User account is not available'
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const newTokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set new cookies
    setAuthCookies(newTokens);

    // Remove sensitive data
    const { password_hash, ...safeUser } = user as any;

    logger.info('Token refreshed successfully', { 
      userId: user.id, 
      email: user.email 
    });

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user: safeUser,
      tokens: {
        accessToken: newTokens.accessToken,
      }
    });

  } catch (error) {
    logger.error('Token refresh error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token refresh failed',
        message: 'An error occurred during token refresh'
      },
      { status: 500 }
    );
  }
}