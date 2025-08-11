import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Star, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

interface TripStop {
  id: string;
  city: { id: string; name: string; country: string };
  start_date: string;
  end_date: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  min_cost?: string;
  max_cost?: string;
  duration?: number;
  image_url?: string;
}

interface SelectedActivity {
  activity_id: string;
  date: string;
  time: string;
  min_cost_override: string;
  max_cost_override: string;
}

const AddActivities: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [activities, setActivities] = useState<{ [stopId: string]: Activity[] }>({});
  const [selectedActivities, setSelectedActivities] = useState<{ [stopId: string]: SelectedActivity[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tripName, setTripName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!tripId) return;
    
    const user = localStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    axios.get(`http://localhost:3000/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setTripStops(res.data.data.tripStops);
        setTripName(res.data.data.name || 'Your Trip');
        
        // Fetch activities for each stop
        res.data.data.tripStops.forEach((stop: TripStop) => {
          axios.get(`http://localhost:3000/api/locations/cities/${stop.city.id}/activities`)
            .then(aRes => {
              setActivities(prev => ({ ...prev, [stop.id]: aRes.data.data.activities }));
            })
            .catch(() => {
              // Fallback to mock data
              const mockActivities: Activity[] = [
                {
                  id: `mock-${stop.id}-1`,
                  name: `Explore ${stop.city.name} Historic Center`,
                  category: "culture",
                  description: `Discover the cultural heritage of ${stop.city.name}`,
                  min_cost: "15.00",
                  max_cost: "25.00",
                  duration: 180,
                  image_url: "https://images.unsplash.com/photo-1566139884914-2a9abb3d1e75?w=400"
                },
                {
                  id: `mock-${stop.id}-2`,
                  name: `${stop.city.name} Food Tour`,
                  category: "food",
                  description: `Taste authentic local cuisine and culinary delights`,
                  min_cost: "35.00",
                  max_cost: "65.00",
                  duration: 240,
                  image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
                },
                {
                  id: `mock-${stop.id}-3`,
                  name: `${stop.city.name} Adventure Walk`,
                  category: "adventure",
                  description: `Scenic walking tour through the best neighborhoods`,
                  min_cost: "20.00",
                  max_cost: "30.00",
                  duration: 150,
                  image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400"
                }
              ];
              setActivities(prev => ({ ...prev, [stop.id]: mockActivities }));
            });
        });
      })
      .catch(() => setError('Failed to load trip details'));
  }, [tripId]);

  const handleSelectActivity = (stopId: string, activityId: string, checked: boolean) => {
    setSelectedActivities(prev => {
      const prevList = prev[stopId] || [];
      if (checked) {
        return { 
          ...prev, 
          [stopId]: [...prevList, { 
            activity_id: activityId, 
            date: '', 
            time: '', 
            min_cost_override: '', 
            max_cost_override: '' 
          }] 
        };
      } else {
        return { 
          ...prev, 
          [stopId]: prevList.filter(a => a.activity_id !== activityId) 
        };
      }
    });
  };

  const handleActivityDetailChange = (stopId: string, activityId: string, field: string, value: string) => {
    setSelectedActivities(prev => {
      const updated = (prev[stopId] || []).map(a =>
        a.activity_id === activityId ? { ...a, [field]: value } : a
      );
      return { ...prev, [stopId]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : null;
      if (!token) throw new Error('Not authenticated');
      
      for (const stop of tripStops) {
        const acts = selectedActivities[stop.id] || [];
        for (const act of acts) {
          await axios.post(`http://localhost:3000/api/trips/${tripId}/stops/${stop.id}/activities`, act, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      
      navigate(`/trips/${tripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add activities');
    } finally {
      setLoading(false);
    }
  };

  const getTotalSelectedActivities = () => {
    return Object.values(selectedActivities).reduce((total, stopActivities) => total + stopActivities.length, 0);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Add Activities
          </h2>
          <p className="text-xl text-gray-600 mb-2">Enhance your trip: {tripName}</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Choose from amazing activities at each destination to make your trip unforgettable. 
            Select what interests you most and customize the details.
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Activity Selection Progress</h3>
                <p className="text-gray-600">
                  {getTotalSelectedActivities()} activities selected across {tripStops.length} destinations
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{getTotalSelectedActivities()}</div>
              <div className="text-sm text-gray-500">Total Activities</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center mb-8 max-w-4xl mx-auto">
            {error}
          </div>
        )}

        {/* Activities by Stop */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
          {tripStops.map((stop, index) => (
            <div key={stop.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 animate-fade-in">
              {/* Stop Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-blue-500" />
                      {stop.city.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{stop.start_date} to {stop.end_date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {(selectedActivities[stop.id] || []).length} selected
                  </div>
                  <div className="text-sm text-gray-500">activities</div>
                </div>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activities[stop.id] || []).length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No activities found for this destination</p>
                    <p className="text-gray-400">Check back later for more options</p>
                  </div>
                ) : (
                  (activities[stop.id] || []).map(activity => {
                    const selected = (selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id);
                    const isSelected = !!selected;
                    
                    return (
                      <div
                        key={activity.id}
                        className={`bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                          isSelected ? 'border-green-500 ring-2 ring-green-200 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectActivity(stop.id, activity.id, !isSelected)}
                      >
                        {/* Activity Image */}
                        <div className="h-40 bg-gray-200 rounded-t-2xl overflow-hidden relative">
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
                          
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                              {activity.category}
                            </span>
                          </div>
                        </div>
                        
                        {/* Activity Details */}
                        <div className="p-6">
                          <h4 className="font-bold text-lg mb-2 text-gray-800">{activity.name}</h4>
                          <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden leading-relaxed">
                            {activity.description}
                          </p>
                          
                          {/* Price and Duration */}
                          <div className="flex items-center justify-between mb-4">
                            {activity.min_cost && activity.max_cost && (
                              <div className="flex items-center text-green-600 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>{activity.min_cost} - {activity.max_cost}</span>
                              </div>
                            )}
                            {activity.duration && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                              </div>
                            )}
                          </div>

                          {/* Activity Details Form */}
                          {isSelected && selected && (
                            <div className="border-t pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                  <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                    value={selected.date || ''}
                                    onChange={(e) => handleActivityDetailChange(stop.id, activity.id, 'date', e.target.value)}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                                  <input
                                    type="time"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                    value={selected.time || ''}
                                    onChange={(e) => handleActivityDetailChange(stop.id, activity.id, 'time', e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Cost Override</label>
                                  <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="Optional"
                                    value={selected.min_cost_override || ''}
                                    onChange={(e) => handleActivityDetailChange(stop.id, activity.id, 'min_cost_override', e.target.value)}
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Cost Override</label>
                                  <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="Optional"
                                    value={selected.max_cost_override || ''}
                                    onChange={(e) => handleActivityDetailChange(stop.id, activity.id, 'max_cost_override', e.target.value)}
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="text-center pt-8">
            <Button
              type="submit"
              disabled={loading}
              className="px-12 py-4 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving Activities...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-3" />
                  Save Activities & Complete Trip
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivities;
