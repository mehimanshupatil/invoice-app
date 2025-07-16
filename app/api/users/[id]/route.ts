import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import { logger } from '@/lib/logger';
import { withAuth, withAdminRole, AuthenticatedRequest } from '@/lib/auth/middleware';

// GET /api/users/[id] - Get user by ID
async function getUser(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await UserModel.getById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: 'No user found with the provided ID'
        },
        { status: 404 }
      );
    }

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user as any;

    return NextResponse.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    logger.error('Failed to get user', { id: params.id, error });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
async function updateUser(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, name, password, role, is_active } = body;

    // Validation
    if (role && !['Admin', 'Accountant', 'Viewer'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role',
          message: 'Role must be Admin, Accountant, or Viewer'
        },
        { status: 400 }
      );
    }

    if (email) {
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
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password too short',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    const user = await UserModel.update(params.id, updateData);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: 'No user found with the provided ID'
        },
        { status: 404 }
      );
    }

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user as any;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update user', { id: params.id, error });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (soft delete)
async function deleteUser(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await UserModel.delete(params.id);
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: 'No user found with the provided ID or user already deleted'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete user', { id: params.id, error });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUser);
export const PUT = withAdminRole(updateUser);
export const DELETE = withAdminRole(deleteUser);