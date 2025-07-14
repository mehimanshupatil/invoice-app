import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import { logger } from '@/lib/logger';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    let users;
    if (role && ['Admin', 'Accountant', 'Viewer'].includes(role)) {
      users = await UserModel.getByRole(role as 'Admin' | 'Accountant' | 'Viewer');
    } else {
      users = await UserModel.getAll(includeDeleted);
    }

    // Remove password_hash from response
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user as any;
      return safeUser;
    });

    return NextResponse.json({
      success: true,
      data: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    logger.error('Failed to get users', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Email, name, password, and role are required'
        },
        { status: 400 }
      );
    }

    if (!['Admin', 'Accountant', 'Viewer'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role',
          message: 'Role must be Admin, Accountant, or Viewer'
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password too short',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    const user = await UserModel.create({ email, name, password, role });
    
    // Remove password_hash from response
    const { password_hash, ...safeUser } = user as any;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create user', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already exists',
          message: 'A user with this email address already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}