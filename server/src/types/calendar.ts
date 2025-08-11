export interface CalendarTrip {
  id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  cover_photo?: string;
  is_public: boolean;
  duration_days: number;
  destinations: string;
}

export interface MonthlyTripOverview {
  month: number;
  month_name: string;
  trip_count: number;
  trips: Array<{
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    destinations: string;
  }>;
}

export interface YearlyTripSummary {
  total_trips: number;
  total_travel_days: number;
  busiest_month: MonthlyTripOverview;
}

export interface CalendarResponse {
  success: boolean;
  data: {
    trips: CalendarTrip[];
    month?: number;
    year?: number;
    date_range?: {
      start: Date;
      end: Date;
    };
    total: number;
  };
}

export interface YearOverviewResponse {
  success: boolean;
  data: {
    year: number;
    monthly_overview: MonthlyTripOverview[];
    yearly_summary: YearlyTripSummary;
  };
}
