import { Response } from 'express';
import { Trip, User } from '../models';
import { AuthenticatedRequest, TripWithDetails } from '../types/trip';
import { TripUtils } from '../utils/tripUtils';

export class TripController {
  /**
   * Get top regional selections (most popular trips in the user's region)
   * Finds trips by users from the same country, ordered by popularity
   */
  static async getTopRegionalSelections(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get current user's country
      const currentUser = await User.findByPk(userId, {
        attributes: ['country']
      });

      if (!currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { country } = currentUser;
      const { limit = 10, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Use Trip model method
      const popularTrips = await Trip.findRegionalSelections(
        userId, 
        country, 
        Number(limit), 
        offset
      );

      // Calculate trip metrics for better sorting
      const tripsWithMetrics = popularTrips.map(trip => {
        const tripData = trip.toJSON();
        return TripUtils.calculateTripMetrics(tripData, userId);
      });

      res.status(200).json({
        success: true,
        data: {
          trips: tripsWithMetrics,
          region: country,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: tripsWithMetrics.length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching top regional selections:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top regional selections',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's previous trips (completed trips sorted by most recent first)
   */
  static async getPreviousTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { limit = 10, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Use Trip model method
      const previousTrips = await Trip.findPreviousTrips(
        userId, 
        Number(limit), 
        offset
      );

      // Add trip metrics
      const tripsWithMetrics = previousTrips.map(trip => {
        const tripData = trip.toJSON();
        return TripUtils.calculateTripMetrics(tripData, userId);
      });

      res.status(200).json({
        success: true,
        data: {
          trips: tripsWithMetrics,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: tripsWithMetrics.length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching previous trips:', error);
      res.status(500).json({ 
        error: 'Failed to fetch previous trips',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's upcoming trips (starting after today)
   */
  static async getUpcomingTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { limit = 10, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Use Trip model method
      const upcomingTrips = await Trip.findUpcomingTrips(
        userId, 
        Number(limit), 
        offset
      );

      // Add trip metrics and countdown
      const tripsWithMetrics = upcomingTrips.map(trip => {
        const tripData = trip.toJSON();
        return TripUtils.addCountdownToTrip(tripData, userId);
      });

      res.status(200).json({
        success: true,
        data: {
          trips: tripsWithMetrics,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: tripsWithMetrics.length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching upcoming trips:', error);
      res.status(500).json({ 
        error: 'Failed to fetch upcoming trips',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific trip with full details
   */
  static async getTripById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Use Trip model method
      const trip = await Trip.findByIdWithDetails(tripId, userId);

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      const tripData = trip.toJSON();
      const tripWithMetrics = TripUtils.calculateTripMetrics(tripData, userId);

      res.status(200).json({
        success: true,
        data: tripWithMetrics
      });
    } catch (error) {
      console.error('Error fetching trip details:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trip details',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
