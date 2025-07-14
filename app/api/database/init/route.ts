import { NextRequest, NextResponse } from 'next/server';
import { testConnection, initializeDatabase } from '@/lib/database';
import { logger } from '@/lib/logger';

// GET /api/database/init - Test database connection
export async function GET() {
  try {
    const isConnected = await testConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Database connection successful' : 'Database connection failed'
    });
  } catch (error) {
    logger.error('Database connection test failed', error);
    return NextResponse.json(
      { 
        success: false, 
        connected: false,
        error: 'Database connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/database/init - Initialize database tables
export async function POST() {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    logger.error('Database initialization failed', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}