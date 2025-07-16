import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookies
    clearAuthCookies();

    logger.info('User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed',
        message: 'An error occurred during logout'
      },
      { status: 500 }
    );
  }
}