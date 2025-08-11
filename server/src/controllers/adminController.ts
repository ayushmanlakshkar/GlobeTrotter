import { Request, Response, NextFunction } from 'express';
import {User} from '../models/User';
import {Trip} from '../models/Trip';
import {Activity} from '../models/Activity';
import {City} from '../models/City';
import {TripActivity} from '../models/TripActivity';

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
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      include: [{ model: Trip, attributes: [] }],
      order: [[Trip, 'id', 'DESC']],
      limit: 10
    });
    res.json(cities);
  } catch (err) {
    next(err);
  }
};

// Get popular activities (by number of times added to trips)
export const getPopularActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await Activity.findAll({
      attributes: ['id', 'name'],
      include: [{ model: TripActivity, attributes: [] }],
      order: [[TripActivity, 'id', 'DESC']],
      limit: 10
    });
    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// Get user trends and analytics (example: trips per month)
export const getUserTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Example: count trips per month
    const trends = await Trip.findAll({
      attributes: [
        [User.sequelize!.fn('DATE_TRUNC', 'month', User.sequelize!.col('createdAt')), 'month'],
        [User.sequelize!.fn('COUNT', '*'), 'tripCount']
      ],
      group: ['month'],
      order: [['month', 'DESC']]
    });
    res.json(trends);
  } catch (err) {
    next(err);
  }
};
