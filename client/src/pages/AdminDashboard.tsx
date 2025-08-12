import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/admin.service';
import authService from '../services/auth.service';
import StatCard from '../components/StatCard';
import UserTable from '../components/UserTable';
import AnalyticsCharts from '../components/AnalyticsCharts';

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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTrips: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [popularActivities, setPopularActivities] = useState<PopularActivity[]>([]);
  const [userTrends, setUserTrends] = useState<UserTrend[]>([]);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [currentUser, navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all data in parallel
        const [
          statsData,
          usersData,
          citiesData,
          activitiesData,
          trendsData
        ] = await Promise.all([
          adminService.getStats(),
          adminService.getAllUsers(),
          adminService.getPopularCities(),
          adminService.getPopularActivities(),
          adminService.getUserTrends(),
        ]);

        setStats(statsData);
        setUsers(usersData);
        setPopularCities(citiesData);
        setPopularActivities(activitiesData);
        setUserTrends(trendsData);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          authService.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.user?.role === 'admin') {
      loadDashboardData();
    }
  }, []);

  // Handle user edit
  const handleEditUser = async (user: User) => {
    // For now, just log - you can implement a modal or form later
    console.log('Edit user:', user);
    alert(`Edit functionality for ${user.first_name} ${user.last_name} would be implemented here.`);
  };

  // Handle user delete
  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`);
    if (!confirmed) return;

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      alert('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  if (!currentUser || currentUser.user?.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {[
              { key: 'overview', label: 'Overview', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
              { key: 'users', label: 'Manage Users', icon: '👥', gradient: 'from-purple-500 to-pink-500' },
              { key: 'analytics', label: 'Analytics', icon: '📈', gradient: 'from-green-500 to-emerald-500' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? `border-transparent bg-gradient-to-r ${tab.gradient} text-white rounded-t-xl shadow-lg transform -translate-y-1`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-t-lg'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {currentUser.user.first_name}!</h2>
                  <p className="text-blue-100 text-lg">Here's what's happening on your platform today.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-200">Today's Date</div>
                  <div className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                }
                description="Registered users"
                gradient="from-blue-500 to-cyan-500"
                trend={{
                  value: "+12%",
                  positive: true
                }}
              />
              <StatCard
                title="Total Trips"
                value={stats.totalTrips}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                }
                description="Created trips"
                gradient="from-purple-500 to-pink-500"
                trend={{
                  value: "+8%",
                  positive: true
                }}
              />
              <StatCard
                title="Average Trips"
                value={stats.totalUsers > 0 ? (stats.totalTrips / stats.totalUsers).toFixed(1) : '0'}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                }
                description="Per user"
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Top Destination"
                value={popularCities[0]?.name || 'N/A'}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                }
                description={popularCities[0] ? `${popularCities[0].tripCount} trips` : 'No data'}
                gradient="from-yellow-500 to-orange-500"
              />
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">📈</span>
                    Platform Summary
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Active Users</span>
                    <span className="text-blue-600 font-bold">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Destinations</span>
                    <span className="text-purple-600 font-bold">{popularCities.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Available Activities</span>
                    <span className="text-green-600 font-bold">{popularActivities.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Platform Growth</span>
                    <span className="text-orange-600 font-bold">+12%</span>
                  </div>
                </div>
              </div>

              {/* Top Destinations Quick View */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🌍</span>
                    Top Destinations
                  </h3>
                </div>
                <div className="p-6">
                  {popularCities.length > 0 ? (
                    <div className="space-y-3">
                      {popularCities.slice(0, 5).map((city, index) => (
                        <div key={city.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{city.name}</div>
                              <div className="text-sm text-gray-600">{city.country}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{city.tripCount}</div>
                            <div className="text-xs text-gray-600">trips</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No destination data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700">Manage Users</div>
                      <div className="text-sm text-gray-600">View and edit user accounts</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 group"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-purple-700">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed insights and charts</div>
                    </div>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-200 group">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-900 group-hover:text-green-700">Export Data</div>
                      <div className="text-sm text-gray-600">Download platform reports</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <UserTable
              users={users}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              loading={loading}
              currentUserId={currentUser?.user?.id}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-2">Advanced Analytics & Insights</h2>
              <p className="text-purple-100 text-lg mb-6">
                Deep dive into user behavior, travel patterns, and platform performance metrics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.totalUsers > 0 ? (stats.totalTrips / stats.totalUsers).toFixed(1) : '0'}</div>
                  <div className="text-sm text-purple-100">Avg trips per user</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{popularCities[0]?.name || 'N/A'}</div>
                  <div className="text-sm text-purple-100">Top destination</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold capitalize">{popularActivities[0]?.category || 'N/A'}</div>
                  <div className="text-sm text-purple-100">Popular category</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {userTrends.length > 0 ? userTrends.reduce((sum, trend) => sum + parseInt(trend.tripCount), 0) : 0}
                  </div>
                  <div className="text-sm text-purple-100">Total monthly trips</div>
                </div>
              </div>
            </div>
            
            {/* Main Analytics Charts */}
            <AnalyticsCharts
              popularCities={popularCities}
              popularActivities={popularActivities}
              userTrends={userTrends}
              loading={loading}
            />

            {/* Advanced Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                  <h3 className="text-xl font-bold">Performance Metrics</h3>
                  <p className="text-blue-100">Platform growth and engagement stats</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <span className="text-gray-700 font-medium">User Engagement Rate</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="font-bold text-blue-600">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Trip Completion Rate</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="text-gray-700 font-medium">User Satisfaction</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="font-bold text-purple-600">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Monthly Growth</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="font-bold text-orange-600">+15%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <h3 className="text-xl font-bold">Geographic Insights</h3>
                  <p className="text-green-100">Travel patterns by region</p>
                </div>
                <div className="p-6">
                  {popularCities.length > 0 ? (
                    <div className="space-y-4">
                      {popularCities.slice(0, 6).map((city) => {
                        const percentage = popularCities.length > 0 
                          ? (parseInt(city.tripCount) / popularCities.reduce((sum, c) => sum + parseInt(c.tripCount), 0)) * 100 
                          : 0;
                        return (
                          <div key={city.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="font-medium text-gray-900">{city.name}, {city.country}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-600">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No geographic data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Analytics Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Analysis */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🎯</span>
                    Activity Performance Analysis
                  </h3>
                </div>
                <div className="p-6">
                  {popularActivities.length > 0 ? (
                    <div className="space-y-3">
                      {popularActivities.slice(0, 8).map((activity, index) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <span className="text-sm font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{activity.name}</div>
                              <div className="text-sm text-gray-600 capitalize">{activity.category} activity</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{activity.usageCount}</div>
                            <div className="text-xs text-gray-600">bookings</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No activity data available
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Actions & Reports */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">📊</span>
                    Advanced Reports & Actions
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full text-left px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700">Export Analytics Report</div>
                        <div className="text-sm text-gray-600">Download comprehensive data analysis</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200 border border-green-200 hover:border-green-300 group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-green-700">Generate Monthly Report</div>
                        <div className="text-sm text-gray-600">Create automated insights & trends</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200 border border-purple-200 hover:border-purple-300 group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-purple-700">Custom Analytics Dashboard</div>
                        <div className="text-sm text-gray-600">Configure personalized metrics</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full text-left px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-xl transition-all duration-200 border border-yellow-200 hover:border-orange-300 group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-orange-700">Real-time Monitoring</div>
                        <div className="text-sm text-gray-600">Live platform activity tracking</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
