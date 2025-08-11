import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string; // 'user' or 'admin'
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface TripWithDetails {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  cover_photo?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  tripStops?: any[];
  user?: any;
  trip_stops_count?: number;
  duration_days?: number;
  total_activities?: number;
  days_until_trip?: number;
  is_owner?: boolean;
}
