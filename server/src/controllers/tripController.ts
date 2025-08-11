import { Response } from 'express';
import { Op } from 'sequelize';
import { Trip, User, TripStop, TripActivity, City, Activity } from '../models';
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

  /**
   * Create a new trip
   */
  static async createTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name, description, start_date, end_date, cover_photo, is_public = true } = req.body;

      // Validate required fields
      if (!name || !start_date || !end_date) {
        res.status(400).json({ error: 'Name, start_date, and end_date are required' });
        return;
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      if (startDate >= endDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }

      // Create trip
      const trip = await Trip.create({
        user_id: userId,
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        cover_photo,
        is_public
      });

      res.status(201).json({
        success: true,
        data: trip
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      res.status(500).json({ 
        error: 'Failed to create trip',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add a stop to a trip
   */
  static async addTripStop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { city_id, start_date, end_date, order_index } = req.body;

      // Validate required fields
      if (!city_id || !start_date || !end_date) {
        res.status(400).json({ error: 'city_id, start_date, and end_date are required' });
        return;
      }

      // Check if trip exists and user owns it
      const trip = await Trip.findOne({
        where: { id: tripId, user_id: userId }
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // Check if city exists
      const city = await City.findByPk(city_id);
      if (!city) {
        res.status(404).json({ error: 'City not found' });
        return;
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      if (startDate >= endDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }

      // Check if dates are within trip bounds
      if (startDate < trip.start_date || endDate > trip.end_date) {
        res.status(400).json({ error: 'Stop dates must be within trip dates' });
        return;
      }

      // Get next order index if not provided
      const finalOrderIndex = order_index !== undefined 
        ? order_index 
        : (await TripStop.getMaxOrderIndexForTrip(tripId)) + 1;

      // Create trip stop
      const tripStop = await TripStop.create({
        trip_id: tripId,
        city_id,
        start_date: startDate,
        end_date: endDate,
        order_index: finalOrderIndex
      });

      res.status(201).json({
        success: true,
        data: tripStop
      });
    } catch (error) {
      console.error('Error adding trip stop:', error);
      res.status(500).json({ 
        error: 'Failed to add trip stop',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove a stop from a trip
   */
  static async removeTripStop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if trip exists and user owns it
      const trip = await Trip.findOne({
        where: { id: tripId, user_id: userId }
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // Find and delete the trip stop
      const tripStop = await TripStop.findOne({
        where: { id: stopId, trip_id: tripId }
      });

      if (!tripStop) {
        res.status(404).json({ error: 'Trip stop not found' });
        return;
      }

      // Delete associated activities first
      await TripActivity.destroy({
        where: { trip_stop_id: stopId }
      });

      // Delete the trip stop
      await tripStop.destroy();

      res.status(200).json({
        success: true,
        message: 'Trip stop removed successfully'
      });
    } catch (error) {
      console.error('Error removing trip stop:', error);
      res.status(500).json({ 
        error: 'Failed to remove trip stop',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add an activity to a trip stop
   */
  static async addTripActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { activity_id, date, time, min_cost_override, max_cost_override } = req.body;

      // Validate required fields
      if (!activity_id || !date) {
        res.status(400).json({ error: 'activity_id and date are required' });
        return;
      }

      // Check if trip exists and user owns it
      const trip = await Trip.findOne({
        where: { id: tripId, user_id: userId }
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // Check if trip stop exists and belongs to the trip
      const tripStop = await TripStop.findOne({
        where: { id: stopId, trip_id: tripId }
      });

      if (!tripStop) {
        res.status(404).json({ error: 'Trip stop not found' });
        return;
      }

      // Check if activity exists
      const activity = await Activity.findByPk(activity_id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      // Validate date
      const activityDate = new Date(date);
      if (isNaN(activityDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      // Check if date is within trip stop bounds
      if (activityDate < tripStop.start_date || activityDate > tripStop.end_date) {
        res.status(400).json({ error: 'Activity date must be within trip stop dates' });
        return;
      }

      // Create trip activity
      const tripActivity = await TripActivity.create({
        trip_stop_id: stopId,
        activity_id,
        date: activityDate,
        time,
        min_cost_override,
        max_cost_override
      });

      res.status(201).json({
        success: true,
        data: tripActivity
      });
    } catch (error) {
      console.error('Error adding trip activity:', error);
      res.status(500).json({ 
        error: 'Failed to add trip activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove an activity from a trip stop
   */
  static async removeTripActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId, stopId, activityId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if trip exists and user owns it
      const trip = await Trip.findOne({
        where: { id: tripId, user_id: userId }
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // Check if trip stop exists and belongs to the trip
      const tripStop = await TripStop.findOne({
        where: { id: stopId, trip_id: tripId }
      });

      if (!tripStop) {
        res.status(404).json({ error: 'Trip stop not found' });
        return;
      }

      // Find and delete the trip activity
      const tripActivity = await TripActivity.findOne({
        where: { id: activityId, trip_stop_id: stopId }
      });

      if (!tripActivity) {
        res.status(404).json({ error: 'Trip activity not found' });
        return;
      }

      await tripActivity.destroy();

      res.status(200).json({
        success: true,
        message: 'Trip activity removed successfully'
      });
    } catch (error) {
      console.error('Error removing trip activity:', error);
      res.status(500).json({ 
        error: 'Failed to remove trip activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get suggested places for a trip (placeholder - returns empty array as requested)
   */
  static async getSuggestedPlaces(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if trip exists and user has access
      const trip = await Trip.findByIdWithDetails(tripId, userId);

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // Return empty array as requested
      res.status(200).json({
        success: true,
        data: {
          suggestions: []
        }
      });
    } catch (error) {
      console.error('Error fetching suggested places:', error);
      res.status(500).json({ 
        error: 'Failed to fetch suggested places',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get suggested activities for a trip by city
   */
  static async getSuggestedActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const { city_id, category, min_cost, max_cost, limit = 20 } = req.query;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check if trip exists and user has access
      const trip = await Trip.findByIdWithDetails(tripId, userId);

      if (!trip) {
        res.status(404).json({ error: 'Trip not found or access denied' });
        return;
      }

      // city_id is required
      if (!city_id) {
        res.status(400).json({ error: 'city_id query parameter is required' });
        return;
      }

      // Verify city exists
      const city = await City.findByPk(city_id as string);
      if (!city) {
        res.status(404).json({ error: 'City not found' });
        return;
      }

      // Build query conditions
      let whereClause: any = { city_id: city_id as string };
      
      // Add category filter if provided
      if (category) {
        whereClause.category = category;
      }

      // Add cost range filter if provided
      if (min_cost || max_cost) {
        const minCost = min_cost ? parseFloat(min_cost as string) : 0;
        const maxCost = max_cost ? parseFloat(max_cost as string) : Number.MAX_SAFE_INTEGER;
        
        whereClause = {
          ...whereClause,
          [Op.and]: [
            {
              [Op.or]: [
                { min_cost: null },
                { min_cost: { [Op.lte]: maxCost } }
              ]
            },
            {
              [Op.or]: [
                { max_cost: null },
                { max_cost: { [Op.gte]: minCost } }
              ]
            }
          ]
        };
      }

      // Get activities for the specified city
      const activities = await Activity.findAll({
        where: whereClause,
        limit: parseInt(limit as string),
        order: [['name', 'ASC']],
      });

      res.status(200).json({
        success: true,
        data: {
          city: {
            id: city.id,
            name: city.name,
            country: city.country
          },
          suggestions: activities,
          filters: {
            category: category || null,
            min_cost: min_cost || null,
            max_cost: max_cost || null,
            limit: parseInt(limit as string)
          },
          total: activities.length
        }
      });
    } catch (error) {
      console.error('Error fetching suggested activities:', error);
      res.status(500).json({ 
        error: 'Failed to fetch suggested activities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
