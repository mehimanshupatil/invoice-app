import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import { generateTokenPair, setAuthCookies } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing credentials',
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await UserModel.authenticate(email, password);
    
    if (!user) {
      logger.warn('Login attempt failed', { email });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account disabled',
          message: 'Your account has been disabled'
        },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookies
    setAuthCookies(tokens);

    // Remove sensitive data
    const { password_hash, ...safeUser } = user as any;

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token in response for security
      }
    });

  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed',
        message: 'An error occurred during login'
      },
      { status: 500 }
    );
  }
}