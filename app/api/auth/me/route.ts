import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { UserModel } from '@/lib/models/User';
import { logger } from '@/lib/logger';

async function handler(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { success: false, error: 'User not found in request' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await UserModel.getById(request.user.userId);
    
    if (!user || !user.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: 'User account is not available'
        },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { password_hash, ...safeUser } = user as any;

    return NextResponse.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    logger.error('Get current user error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user data',
        message: 'An error occurred while fetching user data'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);