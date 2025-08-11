import axios from 'axios';
import { authHeader } from '../utils/auth-header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  role: string;
  avatar_url?: string;
  additional_info?: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalUsers: number;
  totalTrips: number;
}

interface PopularCity {
  id: string;
  name: string;
  country: string;
  tripCount: string;
}

interface PopularActivity {
  id: string;
  name: string;
  category: string;
  usageCount: string;
}

interface UserTrend {
  month: string;
  tripCount: string;
}

// Get all users
const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: authHeader()
  });
  return response.data;
};

// Get user by ID
const getUserById = async (id: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/admin/users/${id}`, {
    headers: authHeader()
  });
  return response.data;
};

// Update user
const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`${API_URL}/admin/users/${id}`, userData, {
    headers: authHeader()
  });
  return response.data;
};

// Delete user
const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
    headers: authHeader()
  });
  return response.data;
};

// Get platform statistics
const getStats = async (): Promise<Stats> => {
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: authHeader()
  });
  return response.data;
};

// Get popular cities
const getPopularCities = async (): Promise<PopularCity[]> => {
  const response = await axios.get(`${API_URL}/admin/popular-cities`, {
    headers: authHeader()
  });
  return response.data;
};

// Get popular activities
const getPopularActivities = async (): Promise<PopularActivity[]> => {
  const response = await axios.get(`${API_URL}/admin/popular-activities`, {
    headers: authHeader()
  });
  return response.data;
};

// Get user trends
const getUserTrends = async (): Promise<UserTrend[]> => {
  const response = await axios.get(`${API_URL}/admin/user-trends`, {
    headers: authHeader()
  });
  return response.data;
};

const adminService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  getPopularCities,
  getPopularActivities,
  getUserTrends,
};

export default adminService;
