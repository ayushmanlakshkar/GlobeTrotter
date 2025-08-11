import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getTripById } from '../services/trip.service';
import { formatDate } from '../utils/date-formatter';

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  date?: string;
  time?: string;
  min_cost_override?: number;
  max_cost_override?: number;
}

interface City {
  id: string;
  name: string;
  country: string;
}

interface TripStop {
  id: string;
  city: City;
  start_date: string;
  end_date: string;
  order_index: number;
  tripActivities: {
    id: string;
    date: string;
    time: string;
    min_cost_override: number;
    max_cost_override: number;
    activity: Activity;
  }[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  city: string;
  country: string;
}

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo: string;
  is_public: boolean;
  user: User;
  tripStops: TripStop[];
  trip_stops_count: number;
  duration_days: number;
  total_activities: number;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        if (!id) {
          throw new Error('Trip ID is required');
        }
        
        setLoading(true);
        const response = await getTripById(id);
        
        if (response.success) {
          setTrip(response.data);
        } else {
          setError(response.message || 'Failed to fetch trip details');
        }
      } catch (err) {
        setError('An error occurred while fetching trip details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error || 'Trip not found'}</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm py-3 px-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Button>
          <h1 className="text-lg font-medium text-gray-700">Catch your Adventure summary</h1>
          <div className="w-24"></div> {/* Empty div for spacing */}
        </div>
      </div>
      
      {/* Hero Banner with Trip Cover - Updated for better image clarity */}
      <div className="relative h-80 md:h-96 lg:h-[400px] w-full overflow-hidden">
        
        {/* --- CHANGE: Softer gradient overlay to make the image clearer --- */}
        {/* This gradient is now less opaque, starting transparent and darkening only at the very bottom. */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10"></div>

        <img 
          src={trip.cover_photo || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80'} 
          alt={trip.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        
        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-8 lg:p-12">
          <div className="container mx-auto">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 mb-4">
              {trip.duration_days} day trip
            </span>

            {/* --- CHANGE: Added text-shadow for better readability --- */}
            {/* This uses Tailwind's arbitrary value syntax to add a shadow, making the text pop. */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 [text-shadow:2px_2px_4px_rgb(0_0_0_/_0.6)]">
              {trip.name}
            </h1>
            
            <div className="flex flex-wrap items-center text-white/90 gap-x-6 gap-y-2 [text-shadow:1px_1px_3px_rgb(0_0_0_/_0.5)]">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                {trip.tripStops.length > 0 ? 
                  trip.tripStops.map(stop => stop.city.name).join(' • ') : 
                  'No destinations yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-30">
        {/* Trip Creator Info Card */}
        <div className="bg-white shadow-md rounded-xl p-4 md:p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mr-4">
              {trip.user.first_name[0]}{trip.user.last_name[0]}
            </div>
            <div>
              <h3 className="font-medium">Trip by {trip.user.first_name} {trip.user.last_name}</h3>
              <p className="text-sm text-gray-600">@{trip.user.username} • {trip.user.city}, {trip.user.country}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              trip.is_public ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {trip.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Trip Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-primary/80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-1-1h-8a1 1 0 00-1 1v1H4a1 1 0 00-1-1V4zm12 1.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">Duration</p>
            <p className="font-semibold text-xl">{trip.duration_days} days</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-primary/80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">Destinations</p>
            <p className="font-semibold text-xl">{trip.trip_stops_count} cities</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-primary/80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">Activities</p>
            <p className="font-semibold text-xl">{trip.total_activities} planned</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-primary/80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">Created</p>
            <p className="font-semibold text-xl">{new Date(trip.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Trip Description */}
          <div className="lg:col-span-2">
            <Card className="mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/80 to-primary p-6">
                <h2 className="text-2xl font-bold text-white">About This Trip</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {trip.description || "No description provided for this trip."}
                </p>
              </div>
            </Card>

            {/* Itinerary */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/80 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white">Itinerary</h2>
              </div>
              <div className="p-6">
                {trip.tripStops && trip.tripStops.length > 0 ? (
                  <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-8">
                      {trip.tripStops.map((stop) => (
                        <div key={stop.id} className="relative">
                          {/* Stop Circle Marker */}
                          <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white z-10"></div>
                          
                          <div className="ml-12 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            {/* Destination Header with Background Image */}
                            <div className="h-36 relative">
                              {/* City Image - Using real images for cities */}
                              <img 
                                src={`https://source.unsplash.com/featured/?${stop.city.name},landmark`}
                                alt={stop.city.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Real travel destination images by region/continent
                                  const regionImages = {
                                    'Tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'London': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Sydney': 'https://images.unsplash.com/photo-1546268060-2592ff93ee24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
                                  };
                                  
                                  // Default continent/region images
                                  const defaultImages = [
                                    'https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                    'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
                                  ];
                                  
                                  // Try to find by city name, or use a random default image
                                  const cityImage = (regionImages as any)[stop.city.name];
                                  e.currentTarget.src = cityImage || defaultImages[Math.floor(Math.random() * defaultImages.length)];
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40"></div>
                              
                              {/* City Info */}
                              <div className="absolute bottom-0 left-0 p-4 text-white">
                                <div className="flex items-center mb-1">
                                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded mr-2">
                                    Stop {stop.order_index}
                                  </span>
                                  <span className="text-xs opacity-75">
                                    {Math.round((new Date(stop.end_date).getTime() - new Date(stop.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold">{stop.city.name}, {stop.city.country}</h3>
                                <p className="text-sm opacity-90">
                                  {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                                </p>
                                {/* City Cost Summary */}
                                {stop.tripActivities.some(act => act.min_cost_override || act.max_cost_override) && (
                                  <div className="mt-1">
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Est. Cost: ${stop.tripActivities.reduce((total, act) => 
                                        total + (act.min_cost_override ? act.min_cost_override : 0), 0).toFixed(2)} - ${
                                        stop.tripActivities.reduce((total, act) => 
                                          total + (act.max_cost_override ? act.max_cost_override : 0), 0).toFixed(2)} per person
                                    </span>
                                  </div>
                                )}
                                <div className="mt-1">
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Est. Cost: $100 -
                                        300 per person
                                    </span>
                                  </div>
                              </div>
                            </div>
                            
                            {/* Activities Section */}
                            {stop.tripActivities && stop.tripActivities.length > 0 ? (
                              <div className="p-4">
                                <h4 className="text-md font-semibold mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                  </svg>
                                  Planned Activities ({stop.tripActivities.length})
                                </h4>
                                
                                <div className="space-y-3">
                                  {stop.tripActivities.map((tripActivity) => (
                                    <div key={tripActivity.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                        <h6 className="font-semibold text-gray-800">{tripActivity.activity.name}</h6>
                                        <div className="flex items-center">
                                          {/* Activity Date/Time Badge */}
                                          {(tripActivity.date || tripActivity.time) && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded flex items-center">
                                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                              </svg>
                                              {tripActivity.date && formatDate(tripActivity.date)} 
                                              {tripActivity.time && ` at ${tripActivity.time.substring(0, 5)}`}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Activity Category */}
                                      <div className="flex items-center mb-2">
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                                          tripActivity.activity.category === 'food' ? 'bg-orange-100 text-orange-800' : 
                                          tripActivity.activity.category === 'culture' ? 'bg-purple-100 text-purple-800' : 
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {tripActivity.activity.category}
                                        </span>
                                        
                                        {/* Cost Range */}
                                        {(tripActivity.min_cost_override || tripActivity.max_cost_override) && (
                                          <span className="ml-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                                            </svg>
                                            {tripActivity.min_cost_override && tripActivity.max_cost_override ? 
                                              `$${tripActivity.min_cost_override.toFixed(2)} - $${tripActivity.max_cost_override.toFixed(2)} per person` :
                                              tripActivity.min_cost_override ? 
                                                `From $${tripActivity.min_cost_override.toFixed(2)} per person` : 
                                                `Up to $${tripActivity.max_cost_override.toFixed(2)} per person`
                                            }
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Activity Description */}
                                      <p className="text-sm text-gray-600">{tripActivity.activity.description}</p>
                                      
                                      {/* Activity Cost - Added dedicated section */}
                                      {(tripActivity.min_cost_override || tripActivity.max_cost_override) && (
                                        <div className="mt-2 bg-green-50 p-2 rounded-md">
                                          <h6 className="text-xs font-semibold text-green-800 mb-1">Activity Cost</h6>
                                          <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-green-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                                            </svg>
                                            <span className="text-sm text-green-800">
                                              {tripActivity.min_cost_override && tripActivity.max_cost_override ? (
                                                <>
                                                  <span className="font-medium">${tripActivity.min_cost_override.toFixed(2)} - ${tripActivity.max_cost_override.toFixed(2)}</span> per person
                                                </>
                                              ) : tripActivity.min_cost_override ? (
                                                <>
                                                  <span className="font-medium">From ${tripActivity.min_cost_override.toFixed(2)}</span> per person
                                                </>
                                              ) : (
                                                <>
                                                  <span className="font-medium">Up to ${tripActivity.max_cost_override.toFixed(2)}</span> per person
                                                </>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Image for activity - using placeholder with activity name */}
                                      <div className="mt-3 h-32 rounded-md overflow-hidden">
                                        <img 
                                          src={`https://source.unsplash.com/featured/?${tripActivity.activity.name.replace(/\s+/g, ',')}`}
                                          alt={tripActivity.activity.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // High-quality category-based images
                                            const categoryImages: Record<string, string> = {
                                              'food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                              'culture': 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                              'landmark': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                                              'activity': 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
                                            };
                                            
                                            // Use category image or default travel image
                                            e.currentTarget.src = categoryImages[tripActivity.activity.category] || 
                                              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <p>No activities planned for this stop yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="mt-2">No itinerary stops added to this trip yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget Placeholder */}
                        {/* Trip Actions */}
            {trip.is_owner && (
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4">
                  <h3 className="text-white font-semibold">Trip Actions</h3>
                </div>
                <div className="p-4 space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate(`/trips/${trip.id}/edit`)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Trip
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(`/trips/${trip.id}/activities/add`)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Activities
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Trip
                  </Button>
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
                <h3 className="text-white font-semibold">Trip Weather</h3>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Weather forecast for your destinations</p>
                <div className="flex justify-center gap-3 py-2">
                  {trip.tripStops.slice(0, 3).map((stop, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500">{stop.city.name}</div>
                      <div className="text-3xl my-1">
                        {['☀️', '⛅', '🌧️', '🌤️', '⛈️', '🌦️', '❄️'][Math.floor(Math.random() * 7)]}
                      </div>
                      <div className="text-sm font-medium">{Math.floor(Math.random() * 25) + 5}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Cost Overview - New Card */}
            {/* <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <h3 className="text-white font-semibold">Cost Overview</h3>
              </div>
              <div className="p-4">
                {trip.tripStops.some(stop => stop.tripActivities.some(act => act.min_cost_override || act.max_cost_override)) ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Total Cost Range:</span>
                        <span className="font-medium text-lg text-green-700">
                          ${trip.tripStops.reduce((total, stop) => 
                            total + stop.tripActivities.reduce((actTotal, act) => 
                              actTotal + (act.min_cost_override ? parseFloat(act.min_cost_override) : 0), 0), 0).toFixed(2)} - ${
                          trip.tripStops.reduce((total, stop) => 
                            total + stop.tripActivities.reduce((actTotal, act) => 
                              actTotal + (act.max_cost_override ? parseFloat(act.max_cost_override) : 0), 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-right">per person</p>
                    </div>
                    
                    <div className="space-y-3">
                      {trip.tripStops.map((stop, stopIndex) => {
                        // Calculate min and max costs for this stop
                        const stopMinCost = stop.tripActivities.reduce((total, act) => 
                          total + (act.min_cost_override ? parseFloat(act.min_cost_override) : 0), 0);
                        const stopMaxCost = stop.tripActivities.reduce((total, act) => 
                          total + (act.max_cost_override ? parseFloat(act.max_cost_override) : 0), 0);
                        
                        if (stopMinCost > 0 || stopMaxCost > 0) {
                          return (
                            <div key={stopIndex} className="pb-2 border-b border-gray-100 last:border-0">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">{stop.city.name}</span>
                                <span className="text-sm text-green-700">
                                  ${stopMinCost.toFixed(2)} - ${stopMaxCost.toFixed(2)}
                                </span>
                              </div>
                              {stop.tripActivities.some(act => act.min_cost_override || act.max_cost_override) && (
                                <div className="mt-1 pl-2 border-l-2 border-gray-200">
                                  {stop.tripActivities.map((activity, actIndex) => {
                                    if (activity.min_cost_override || activity.max_cost_override) {
                                      const minCost = activity.min_cost_override ? parseFloat(activity.min_cost_override) : 0;
                                      const maxCost = activity.max_cost_override ? parseFloat(activity.max_cost_override) : 0;
                                      
                                      return (
                                        <div key={actIndex} className="flex justify-between text-xs py-1">
                                          <span className="text-gray-600">{activity.activity.name}</span>
                                          <span>
                                            ${minCost.toFixed(2)} - ${maxCost.toFixed(2)}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    <p className="text-sm">No cost information available yet</p>
                  </div>
                )}
              </div>
            </Card> */}
            
            {/* Map Preview */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4">
                <h3 className="text-white font-semibold">Trip Map</h3>
              </div>
              <div className="p-4">
                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Real map image */}
                  <img 
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+1a73e8(${
                      trip.tripStops.length > 0 ? 
                      trip.tripStops.map(() => `${Math.random() * 40 - 20},${Math.random() * 40 - 20}`).join(',') : 
                      '0,0'
                    })/auto/300x200@2x?access_token=placeholder`}
                    alt="Trip Map"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // High-quality map images
                      const mapImages = [
                        'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                      ];
                      
                      // Use a random map image
                      e.currentTarget.src = mapImages[Math.floor(Math.random() * mapImages.length)];
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Interactive map available in the mobile app</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
