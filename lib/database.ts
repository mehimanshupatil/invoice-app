import mysql from 'mysql2/promise';
import { logger } from './logger';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'invoice_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    logger.info('MySQL connection pool created');
  }
  return pool;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const pool = getPool();
  
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Accountant', 'Viewer') NOT NULL DEFAULT 'Viewer',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      )
    `);

    // Create customers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_company (company)
      )
    `);

    // Create invoices table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        type ENUM('Prepaid', 'Postpaid', 'Test') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('Draft', 'Sent', 'Paid', 'Overdue') NOT NULL DEFAULT 'Draft',
        amount DECIMAL(10, 2) NOT NULL,
        send_status ENUM('Send', 'Failed', 'Discard') NOT NULL DEFAULT 'Send',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        INDEX idx_customer (customer_id),
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_dates (start_date, end_date)
      )
    `);

    // Insert default admin user if not exists
    const [existingUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "Admin"'
    );
    
    if ((existingUsers as any)[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await pool.execute(`
        INSERT INTO users (email, name, password_hash, role) VALUES 
        ('admin@company.com', 'John Admin', ?, 'Admin'),
        ('accountant@company.com', 'Sarah Accountant', ?, 'Accountant'),
        ('viewer@company.com', 'Mike Viewer', ?, 'Viewer')
      `, [hashedPassword, hashedPassword, hashedPassword]);
      
      logger.info('Default users created');
    }

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const pool = getPool();
  
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    logger.error('Query execution failed', { query, params, error });
    throw error;
  }
}