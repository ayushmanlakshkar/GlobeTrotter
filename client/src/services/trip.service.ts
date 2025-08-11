import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getCountries = () => axios.get(`${API_URL}/locations/countries`);

export const getCitiesByCountry = (country: string) =>
  axios.get(`${API_URL}/locations/countries/${encodeURIComponent(country)}/cities`);

export const createTrip = (trip: any, token: string) =>
  axios.post(`${API_URL}/trips`, trip, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addTripStop = (tripId: string, stop: any, token: string) =>
  axios.post(`${API_URL}/trips/${tripId}/stops`, stop, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addTripActivity = (tripId: string, stopId: string, activity: any, token: string) =>
  axios.post(`${API_URL}/trips/${tripId}/stops/${stopId}/activities`, activity, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Add more as needed for activities, etc.
