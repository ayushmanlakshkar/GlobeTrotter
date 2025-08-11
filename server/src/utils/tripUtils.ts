import { TripWithDetails } from '../types/trip';

export class TripUtils {
  /**
   * Calculate trip metrics like duration, stops count, activities count
   */
  static calculateTripMetrics(tripData: any, userId?: string): TripWithDetails {
    const trip_stops_count = tripData.tripStops?.length || 0;
    const duration_days = Math.ceil(
      (new Date(tripData.end_date).getTime() - new Date(tripData.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const total_activities = tripData.tripStops?.reduce(
      (acc: number, stop: any) => acc + (stop.tripActivities?.length || 0), 
      0
    ) || 0;

    return {
      ...tripData,
      trip_stops_count,
      duration_days,
      total_activities,
      is_owner: userId ? tripData.user_id === userId : undefined
    };
  }

  /**
   * Calculate days until trip starts
   */
  static calculateDaysUntilTrip(startDate: Date): number {
    return Math.ceil((new Date(startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Add countdown to upcoming trips
   */
  static addCountdownToTrip(tripData: any, userId?: string): TripWithDetails {
    const metricsData = this.calculateTripMetrics(tripData, userId);
    const days_until_trip = this.calculateDaysUntilTrip(tripData.start_date);
    
    return {
      ...metricsData,
      days_until_trip
    };
  }
}
