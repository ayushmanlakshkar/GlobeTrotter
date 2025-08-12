import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Globe, Camera, Clock, DollarSign, Star, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import StepIndicator from '../components/StepIndicator';
import logoSvg from '../assets/logo';

interface CountryResponse {
  success: boolean;
  data: {
    countries: string[];
    total: number;
  };
}

interface City {
  id: string;
  name: string;
  country: string;
}

interface Activity {
  id: string;
  city_id: string;
  name: string;
  description: string;
  min_cost: string;
  max_cost: string;
  duration: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  city: {
    id: string;
    name: string;
    country: string;
  };
}

interface TripStopInput {
  city: City;
  start_date: string;
  end_date: string;
}

interface SelectedActivity {
  activity: Activity;
  date: string;
  time: string;
  cost_override?: number;
}

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Data states
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  
  // Form states
  const [tripDetails, setTripDetails] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_photo: '',
    is_public: false,
  });
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [tripStops, setTripStops] = useState<TripStopInput[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const steps = ['Trip Overview', 'Choose Destinations', 'Select Activities', 'Review & Create'];

  useEffect(() => {
    // Load countries on component mount
    axios.get<CountryResponse>('http://localhost:3000/api/locations/countries')
      .then(res => setCountries(res.data.data.countries))
      .catch(() => setError('Failed to load countries'));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setCities([]);
      axios.get<{ success: boolean; data: { cities: City[] } }>(`http://localhost:3000/api/locations/countries/${encodeURIComponent(selectedCountry)}/cities`)
        .then(res => setCities(res.data.data.cities))
        .catch(() => setError('Failed to load cities'));
    }
  }, [selectedCountry]);

  // Load activities when trip stops change
  useEffect(() => {
    const fetchActivities = async () => {
      if (tripStops.length === 0) {
        setAvailableActivities([]);
        return;
      }

      setLoadingActivities(true);
      try {
        const allActivities: Activity[] = [];
        
        for (const stop of tripStops) {
          if (stop.city.id) {
            try {
              const response = await axios.get<{
                success: boolean;
                data: {
                  city: { id: string; name: string; country: string };
                  activities: Activity[];
                  total: number;
                };
              }>(`http://localhost:3000/api/locations/cities/${stop.city.id}/activities?limit=10`);
              
              allActivities.push(...response.data.data.activities);
            } catch (err) {
              console.warn(`Failed to fetch activities for ${stop.city.name}`);
              
              // Fallback to mock data
              const mockActivities: Activity[] = [
                {
                  id: `activity-${stop.city.id}-1`,
                  city_id: stop.city.id,
                  name: `Explore ${stop.city.name} Historic Center`,
                  description: `Discover the cultural heritage and historic landmarks of ${stop.city.name}`,
                  min_cost: "15.00",
                  max_cost: "25.00",
                  duration: 180,
                  category: "culture",
                  image_url: "https://images.unsplash.com/photo-1566139884914-2a9abb3d1e75?w=400",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  city: stop.city
                },
                {
                  id: `activity-${stop.city.id}-2`,
                  city_id: stop.city.id,
                  name: `${stop.city.name} Food Tour`,
                  description: `Taste authentic local cuisine and discover hidden culinary gems`,
                  min_cost: "35.00",
                  max_cost: "65.00",
                  duration: 240,
                  category: "food",
                  image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  city: stop.city
                },
                {
                  id: `activity-${stop.city.id}-3`,
                  city_id: stop.city.id,
                  name: `${stop.city.name} Adventure Walk`,
                  description: `Scenic walking tour through the best neighborhoods and viewpoints`,
                  min_cost: "20.00",
                  max_cost: "30.00",
                  duration: 150,
                  category: "adventure",
                  image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  city: stop.city
                }
              ];
              allActivities.push(...mockActivities);
            }
          }
        }
        
        setAvailableActivities(allActivities);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [tripStops]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTripDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setTripDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddStop = () => {
    setTripStops([...tripStops, { 
      city: { id: '', name: '', country: selectedCountry }, 
      start_date: '', 
      end_date: '' 
    }]);
  };

  const handleStopChange = (idx: number, field: keyof TripStopInput, value: any) => {
    setTripStops(stops => stops.map((stop, i) => i === idx ? { ...stop, [field]: value } : stop));
  };

  const handleCityChange = (idx: number, cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (city) handleStopChange(idx, 'city', city);
  };

  const handleRemoveStop = (idx: number) => {
    setTripStops(stops => stops.filter((_, i) => i !== idx));
  };

  const toggleActivity = (activity: Activity) => {
    const existingIndex = selectedActivities.findIndex(sa => sa.activity.id === activity.id);
    
    if (existingIndex >= 0) {
      setSelectedActivities(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedActivities(prev => [...prev, {
        activity,
        date: '',
        time: '',
      }]);
    }
  };

  const updateActivityDetails = (activityId: string, field: string, value: string) => {
    setSelectedActivities(prev => prev.map(sa => 
      sa.activity.id === activityId 
        ? { ...sa, [field]: value }
        : sa
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;
      if (!token) throw new Error('Not authenticated');

      // 1. Create Trip
      const tripRes = await axios.post('http://localhost:3000/api/trips', tripDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripId = tripRes.data.data.id;

      // 2. Add Trip Stops
      for (let i = 0; i < tripStops.length; i++) {
        const stop = tripStops[i];
        await axios.post(`http://localhost:3000/api/trips/${tripId}/stops`, {
          city_id: stop.city.id,
          start_date: stop.start_date,
          end_date: stop.end_date,
          order_index: i + 1,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 3. Add selected activities (if any)
      for (const selectedActivity of selectedActivities) {
        const tripStop = tripStops.find(stop => stop.city.id === selectedActivity.activity.city_id);
        if (tripStop) {
          console.log(`Adding activity ${selectedActivity} to trip stop in ${tripStop}`);
          await axios.post(`http://localhost:3000/api/trips/${tripId}/activities`, {
            activity_id: selectedActivity.activity.id,
            date: selectedActivity.date,
            time: selectedActivity.time,
            cost_override: selectedActivity.cost_override || null,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: // Trip Overview
        return !!(tripDetails.name && tripDetails.description && tripDetails.start_date && tripDetails.end_date);
      case 1: // Choose Destinations
        return tripStops.length > 0 && tripStops.every(stop => stop.city.id && stop.start_date && stop.end_date);
      case 2: // Select Activities
        return true; // Activities are optional
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTripOverview();
      case 1:
        return renderChooseDestinations();
      case 2:
        return renderSelectActivities();
      case 3:
        return renderReviewAndCreate();
      default:
        return null;
    }
  };

  const renderTripOverview = () => {
    // Get today's date and future limit (1 year from now)
    const today = new Date().toISOString().split('T')[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const maxDate = oneYearFromNow.toISOString().split('T')[0];

    return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center" 
             dangerouslySetInnerHTML={{ __html: logoSvg }} />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Plan Your Dream Trip
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Let's start by gathering some basic information about your upcoming adventure.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4 mr-2 text-blue-500" />
              Trip Name
            </label>
            <input
              name="name"
              placeholder="e.g., European Summer Adventure"
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors"
              value={tripDetails.name}
              onChange={handleTripDetailChange}
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              Trip Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your trip goals and what you're looking for..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm h-20 resize-none focus:border-blue-500 focus:outline-none transition-colors"
              value={tripDetails.description}
              onChange={handleTripDetailChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  min={today}
                  max={maxDate}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-200"
                  value={tripDetails.start_date}
                  onChange={handleTripDetailChange}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  min={tripDetails.start_date || today}
                  max={maxDate}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-200"
                  value={tripDetails.end_date}
                  onChange={handleTripDetailChange}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Camera className="w-4 h-4 mr-2 text-pink-500" />
              Cover Photo URL (Optional)
            </label>
            <input
              name="cover_photo"
              placeholder="https://example.com/photo.jpg"
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors"
              value={tripDetails.cover_photo}
              onChange={handleTripDetailChange}
            />
          </div>

          <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              name="is_public"
              id="is_public"
              checked={tripDetails.is_public}
              onChange={handleTripDetailChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_public" className="text-gray-700 text-sm font-medium cursor-pointer">
              Make this trip public (others can discover your itinerary)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderChooseDestinations = () => {
    // Get date limits based on trip dates
    const today = new Date().toISOString().split('T')[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const maxDate = oneYearFromNow.toISOString().split('T')[0];
    
    return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Choose Your Destinations
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Select the cities you want to visit and when you'll be there.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-3xl mx-auto">
        {/* Country Selection */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            Select Country
          </label>
          <select
            className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white"
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            required
          >
            <option value="">Choose a country to explore...</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Cities Selection */}
        {selectedCountry && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Cities to Visit</h3>
              <Button
                onClick={handleAddStop}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add City</span>
              </Button>
            </div>

            {tripStops.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No cities added yet</p>
                <p className="text-gray-400 text-sm">Click "Add City" to start planning</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tripStops.map((stop, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-gray-800">Stop {idx + 1}</h4>
                      <Button
                        onClick={() => handleRemoveStop(idx)}
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <select
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-200"
                          value={stop.city.id}
                          onChange={e => handleCityChange(idx, e.target.value)}
                          required
                        >
                          <option value="">Select a city...</option>
                          {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            min={tripDetails.start_date || today}
                            max={maxDate}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-200"
                            value={stop.start_date}
                            onChange={e => handleStopChange(idx, 'start_date', e.target.value)}
                            required
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            min={stop.start_date || tripDetails.start_date || today}
                            max={tripDetails.end_date || maxDate}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-200"
                            value={stop.end_date}
                            onChange={e => handleStopChange(idx, 'end_date', e.target.value)}
                            required
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderSelectActivities = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Choose Your Activities
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Based on your destinations, here are some activities we recommend.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-5xl mx-auto">
        {loadingActivities ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 font-medium text-sm">Loading activities...</p>
            </div>
          </div>
        ) : availableActivities.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No activities available yet</p>
            <p className="text-gray-400 text-sm">Add some destinations first to see recommendations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableActivities.map((activity) => {
              const isSelected = selectedActivities.some(sa => sa.activity.id === activity.id);
              const selectedActivity = selectedActivities.find(sa => sa.activity.id === activity.id);
              
              return (
                <div
                  key={activity.id}
                  className={`bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleActivity(activity)}
                >
                  <div className="p-4">
                    <div className="h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      {activity.image_url ? (
                        <img
                          src={activity.image_url}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Star className="w-8 h-8 text-blue-500" />
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2 text-gray-800">{activity.name}</h4>
                    <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {activity.category}
                      </span>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>{activity.min_cost} - {activity.max_cost}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                      <MapPin className="w-3 h-3 ml-3 mr-1" />
                      <span>{activity.city.name}</span>
                    </div>

                    {isSelected && selectedActivity && (
                      <div className="border-t pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              min={(() => {
                                const cityStop = tripStops.find(stop => stop.city.id === activity.city_id);
                                return cityStop?.start_date || tripDetails.start_date;
                              })()}
                              max={(() => {
                                const cityStop = tripStops.find(stop => stop.city.id === activity.city_id);
                                return cityStop?.end_date || tripDetails.end_date;
                              })()}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              value={selectedActivity.date}
                              onChange={(e) => updateActivityDetails(activity.id, 'date', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                            <input
                              type="time"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              value={selectedActivity.time}
                              onChange={(e) => updateActivityDetails(activity.id, 'time', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedActivities.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Selected Activities ({selectedActivities.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedActivities.map((sa) => (
                <span
                  key={sa.activity.id}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{sa.activity.name}</span>
                  <X
                    className="w-4 h-4 cursor-pointer hover:bg-blue-600 rounded"
                    onClick={() => toggleActivity(sa.activity)}
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewAndCreate = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Review & Create
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Everything looks great! Review your trip details and create your adventure.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-3xl mx-auto space-y-6">
        {/* Trip Overview */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Trip Overview</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">{tripDetails.name}</h4>
            <p className="text-gray-600 mb-4">{tripDetails.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{tripDetails.start_date} to {tripDetails.end_date}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{tripDetails.is_public ? 'Public Trip' : 'Private Trip'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Destinations ({tripStops.length})</h3>
          <div className="space-y-3">
            {tripStops.map((stop, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{stop.city.name}</h4>
                    <p className="text-gray-600 text-sm">{stop.start_date} to {stop.end_date}</p>
                  </div>
                </div>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Activities */}
        {selectedActivities.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Selected Activities ({selectedActivities.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedActivities.map((sa) => (
                <div key={sa.activity.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-1">{sa.activity.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{sa.activity.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{sa.activity.city.name}</span>
                    <span>${sa.activity.min_cost} - ${sa.activity.max_cost}</span>
                  </div>
                  {sa.date && (
                    <div className="mt-2 text-xs text-blue-600">
                      📅 {sa.date} {sa.time && `at ${sa.time}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Step Indicator */}
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />

        {/* Step Content */}
        <div className="mt-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 max-w-3xl mx-auto">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Trip
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceedFromStep(currentStep)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;