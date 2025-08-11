// Calendar API Service for Frontend
// This demonstrates how to use the calendar endpoints from your React frontend

export interface CalendarTrip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo?: string;
  is_public: boolean;
  duration_days?: number;
  destinations?: string;
  status?: 'planning' | 'confirmed' | 'completed' | 'cancelled';
}

export interface CalendarResponse {
  success: boolean;
  data: {
    trips: CalendarTrip[];
    month?: number;
    year?: number;
    total: number;
  };
}

export interface MonthlyOverview {
  month: number;
  month_name: string;
  trip_count: number;
  trips: Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    destinations: string;
  }>;
}

export interface YearlyOverviewResponse {
  success: boolean;
  data: {
    year: number;
    monthly_overview: MonthlyOverview[];
    yearly_summary: {
      total_trips: number;
      total_travel_days: number;
      busiest_month: MonthlyOverview;
    };
  };
}

export interface DateRangeResponse {
  success: boolean;
  data: {
    trips: CalendarTrip[];
    date_range: {
      start: string;
      end: string;
    };
    total: number;
  };
}

export class CalendarService {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string = 'http://localhost:3000/api', authToken: string = '') {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get trips for a specific month to display in calendar view
   */
  async getTripsForMonth(year: number, month: number): Promise<CalendarResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/trips/calendar/month?year=${year}&month=${month}`
    );
    return response.json();
  }

  /**
   * Get trips for a date range (useful for weekly or custom date views)
   */
  async getTripsForDateRange(startDate: string, endDate: string): Promise<DateRangeResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/trips/calendar/date-range?start_date=${startDate}&end_date=${endDate}`
    );
    return response.json();
  }

  /**
   * Get yearly overview with monthly summaries
   */
  async getYearlyOverview(year: number): Promise<YearlyOverviewResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/trips/calendar/year-overview?year=${year}`
    );
    return response.json();
  }

  /**
   * Helper function to get trips for current month
   */
  async getCurrentMonthTrips(): Promise<CalendarResponse> {
    const now = new Date();
    return this.getTripsForMonth(now.getFullYear(), now.getMonth() + 1);
  }

  /**
   * Helper function to get trips for next few months
   */
  async getUpcomingTrips(monthsAhead: number = 3): Promise<CalendarTrip[]> {
    const now = new Date();
    const promises = [];

    for (let i = 0; i < monthsAhead; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      promises.push(
        this.getTripsForMonth(futureDate.getFullYear(), futureDate.getMonth() + 1)
      );
    }

    const results = await Promise.all(promises);
    return results.flatMap(result => result.data.trips);
  }

  /**
   * Format trip for calendar display
   */
  static formatTripForCalendar(trip: CalendarTrip) {
    return {
      id: trip.id,
      title: trip.name,
      start: trip.start_date,
      end: trip.end_date,
      backgroundColor: trip.is_public ? '#3B82F6' : '#EF4444',
      borderColor: trip.is_public ? '#1D4ED8' : '#DC2626',
      extendedProps: {
        description: trip.description,
        destinations: trip.destinations,
        duration: trip.duration_days,
        coverPhoto: trip.cover_photo,
        isPublic: trip.is_public
      }
    };
  }

  /**
   * Get trips formatted for FullCalendar or similar calendar libraries
   */
  async getCalendarEvents(year: number, month: number) {
    const response = await this.getTripsForMonth(year, month);
    return response.data.trips.map(trip => CalendarService.formatTripForCalendar(trip));
  }
}
