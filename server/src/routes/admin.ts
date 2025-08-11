import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getUserStats, getPopularCities, getPopularActivities, getUserTrends } from '../controllers/adminController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// All routes below require authentication and admin authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Statistics
router.get('/stats', getUserStats);

// Popular cities
router.get('/popular-cities', getPopularCities);

// Popular activities
router.get('/popular-activities', getPopularActivities);

// User trends and analytics
router.get('/user-trends', getUserTrends);

export default router;
