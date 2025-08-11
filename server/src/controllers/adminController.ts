import { Request, Response, NextFunction } from 'express';
import { User, Trip, Activity, City, TripActivity, TripStop } from '../models';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Get user statistics (total users, total trips, etc.)
export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.count();
    const totalTrips = await Trip.count();
    res.json({ totalUsers, totalTrips });
  } catch (err) {
    next(err);
  }
};

// Get popular cities (by number of trips)
export const getPopularCities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use raw SQL query to get cities with trip counts
    const cities = await sequelize.query(`
      SELECT 
        c.id, 
        c.name, 
        c.country,
        COUNT(ts.id) as "tripCount"
      FROM cities c
      LEFT JOIN trip_stops ts ON c.id = ts.city_id
      GROUP BY c.id, c.name, c.country
      ORDER BY "tripCount" DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    });
    res.json(cities);
  } catch (err) {
    next(err);
  }
};

// Get popular activities (by number of times added to trips)
export const getPopularActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use raw SQL query to get activities with usage counts
    const activities = await sequelize.query(`
      SELECT 
        a.id, 
        a.name, 
        a.category,
        COUNT(ta.id) as "usageCount"
      FROM activities a
      LEFT JOIN trip_activities ta ON a.id = ta.activity_id
      GROUP BY a.id, a.name, a.category
      ORDER BY "usageCount" DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    });
    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// Get user trends and analytics (example: trips per month)
export const getUserTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Count trips per month using correct column name 'created_at'
    const { Trip } = require('../models');
    const trends = await Trip.findAll({
      attributes: [
        [Trip.sequelize.fn('DATE_TRUNC', 'month', Trip.sequelize.col('created_at')), 'month'],
        [Trip.sequelize.fn('COUNT', '*'), 'tripCount']
      ],
      group: ['month'],
      order: [[Trip.sequelize.literal('month'), 'DESC']]
    });
    res.json(trends);
  } catch (err) {
    next(err);
  }
};
