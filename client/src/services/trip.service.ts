import axios from 'axios';
import { authHeader } from '../utils/auth-header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface RegionalSelection {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

const getRegionalSelections = async (limit: number = 5, page: number = 1) => {
  const response = await axios.get(
    `${API_URL}/trips/regional-selections?limit=${limit}&page=${page}`,
    { headers: authHeader() }
  );
  return response.data;
};

const getPreviousTrips = async () => {
  const response = await axios.get(`${API_URL}/trips/previous`, {
    headers: authHeader(),
  });
  return response.data;
};

const getUpcomingTrips = async () => {
  const response = await axios.get(`${API_URL}/trips/upcoming`, {
    headers: authHeader(),
  });
  return response.data;
};

const getTripDetails = async (tripId: string) => {
  const response = await axios.get(`${API_URL}/trips/${tripId}`, {
    headers: authHeader(),
  });
  return response.data;
};

const tripService = {
  getRegionalSelections,
  getPreviousTrips,
  getUpcomingTrips,
  getTripDetails,
};

export default tripService;
