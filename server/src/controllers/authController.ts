import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CreateUserInput, LoginInput, AuthResponse, UserResponse } from '../types/user';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserInput = req.body;

      // Check if email already exists
      const emailExists = await User.emailExists(userData.email);
      if (emailExists) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Check if username already exists
      const usernameExists = await User.usernameExists(userData.username);
      if (usernameExists) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await User.create({
        ...userData,
        password_hash
      });

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET as string;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Prepare response (exclude password_hash)
      const userResponse: UserResponse = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        country: user.country,
        avatar_url: user.avatar_url,
        additional_info: user.additional_info,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      const response: AuthResponse = {
        user: userResponse,
        token
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Prepare response (exclude password_hash)
      const userResponse: UserResponse = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        country: user.country,
        avatar_url: user.avatar_url,
        additional_info: user.additional_info,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      const response: AuthResponse = {
        user: userResponse,
        token
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userResponse: UserResponse = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        country: user.country,
        avatar_url: user.avatar_url,
        additional_info: user.additional_info,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.status(200).json(userResponse);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
