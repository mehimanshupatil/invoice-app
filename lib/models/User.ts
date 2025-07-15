import { executeQuery } from '../database';
import bcrypt from 'bcryptjs';
import { logger } from '../logger';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: 'Admin' | 'Accountant' | 'Viewer';
  is_active?: boolean;
}

export class UserModel {
  // Get all users
  static async getAll(includeDeleted = false): Promise<DatabaseUser[]> {
    try {
      const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
      const query = `
        SELECT id, email, name, role, is_active, created_at, updated_at, deleted_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
      `;
      
      const users = await executeQuery(query);
      logger.info(`Retrieved ${users.length} users from database`);
      return users;
    } catch (error) {
      logger.error('Failed to get users', error);
      throw new Error('Failed to retrieve users');
    }
  }

  // Get user by ID
  static async getById(id: string): Promise<DatabaseUser | null> {
    try {
      const query = `
        SELECT id, email, name, role, is_active, created_at, updated_at, deleted_at
        FROM users 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const users = await executeQuery(query, [id]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      logger.error('Failed to get user by ID', { id, error });
      throw new Error('Failed to retrieve user');
    }
  }

  // Get user by email
  static async getByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const query = `
        SELECT id, email, name, password_hash, role, is_active, created_at, updated_at
        FROM users 
        WHERE email = ? AND deleted_at IS NULL
      `;
      
      const users = await executeQuery(query, [email]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      logger.error('Failed to get user by email', { email, error });
      throw new Error('Failed to retrieve user');
    }
  }

  // Create new user
  static async create(userData: CreateUserData): Promise<DatabaseUser> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Check if email already exists
      const existingUser = await this.getByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const query = `
        INSERT INTO users (email, name, password_hash, role)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        userData.email,
        userData.name,
        hashedPassword,
        userData.role
      ]);

      // Get the created user
      const createdUser = await this.getByEmail(userData.email);
      if (!createdUser) {
        throw new Error('Failed to retrieve created user');
      }

      logger.info('User created successfully', { email: userData.email, role: userData.role });
      return createdUser;
    } catch (error) {
      logger.error('Failed to create user', { email: userData.email, error });
      throw error;
    }
  }

  // Update user
  static async update(id: string, updateData: UpdateUserData): Promise<DatabaseUser | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.email) {
        updates.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.name) {
        updates.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        updates.push('password_hash = ?');
        values.push(hashedPassword);
      }
      if (updateData.role) {
        updates.push('role = ?');
        values.push(updateData.role);
      }
      if (updateData.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(updateData.is_active);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;

      await executeQuery(query, values);
      
      const updatedUser = await this.getById(id);
      logger.info('User updated successfully', { id });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user', { id, error });
      throw error;
    }
  }

  // Soft delete user
  static async delete(id: string): Promise<boolean> {
    try {
      const query = `
        UPDATE users 
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await executeQuery(query, [id]);
      const success = (result as any).affectedRows > 0;
      
      if (success) {
        logger.info('User deleted successfully', { id });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to delete user', { id, error });
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(email: string, password: string): Promise<DatabaseUser | null> {
    try {
      const user = await this.getByEmail(email);
      if (!user || !user.is_active) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }

      logger.info('User authenticated successfully', { email });
      return user;
    } catch (error) {
      logger.error('Authentication failed', { email, error });
      return null;
    }
  }

  // Get users by role
  static async getByRole(role: 'Admin' | 'Accountant' | 'Viewer'): Promise<DatabaseUser[]> {
    try {
      const query = `
        SELECT id, email, name, role, is_active, created_at, updated_at
        FROM users 
        WHERE role = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const users = await executeQuery(query, [role]);
      logger.info(`Retrieved ${users.length} users with role ${role}`);
      return users;
    } catch (error) {
      logger.error('Failed to get users by role', { role, error });
      throw new Error('Failed to retrieve users by role');
    }
  }
}