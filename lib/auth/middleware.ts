import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromRequest } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: 'Admin' | 'Accountant' | 'Viewer';
  };
}

// Middleware to verify JWT token
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', message: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token', message: 'Token is invalid or expired' },
        { status: 401 }
      );
    }

    // Add user info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return handler(authenticatedRequest);
  };
}

// Middleware to check user roles
export function withRole(roles: string[]) {
  return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (!roles.includes(request.user.role)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Insufficient permissions', 
            message: `Required roles: ${roles.join(', ')}` 
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

// Admin only middleware
export const withAdminRole = withRole(['Admin']);

// Admin and Accountant middleware
export const withAccountantRole = withRole(['Admin', 'Accountant']);

// All authenticated users
export const withAnyRole = withRole(['Admin', 'Accountant', 'Viewer']);