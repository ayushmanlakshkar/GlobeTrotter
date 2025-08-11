import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const CreateTrip: React.FC = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [tripStops, setTripStops] = useState<TripStopInput[]>([]);
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [tripDetails, setTripDetails] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_photo: '',
    is_public: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

  // Fetch suggested activities when trip stops change
  useEffect(() => {
    const fetchSuggestedActivities = async () => {
      if (tripStops.length === 0) {
        setSuggestedActivities([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const allActivities: Activity[] = [];
        
        // Fetch activities for each selected city using the new locations API
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
              }>(`http://localhost:3000/api/locations/cities/${stop.city.id}/activities?limit=3`);
              
              allActivities.push(...response.data.data.activities);
            } catch (err) {
              console.warn(`Failed to fetch activities for ${stop.city.name}`);
              
              // Fallback to mock data if API fails
              const mockActivities: Activity[] = [
                {
                  id: `activity-${stop.city.id}-1`,
                  city_id: stop.city.id,
                  name: `Visit ${stop.city.name} Museum`,
                  description: `Explore the cultural heritage of ${stop.city.name}`,
                  min_cost: "15.00",
                  max_cost: "25.00",
                  duration: 120,
                  category: "culture",
                  image_url: "https://images.unsplash.com/photo-1566139884914-2a9abb3d1e75?w=400",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  city: stop.city
                },
                {
                  id: `activity-${stop.city.id}-2`,
                  city_id: stop.city.id,
                  name: `${stop.city.name} Walking Tour`,
                  description: `Discover the best spots in ${stop.city.name}`,
                  min_cost: "20.00",
                  max_cost: "30.00",
                  duration: 180,
                  category: "sightseeing",
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
        
        // Remove duplicates and limit to 6 total suggestions
        const uniqueActivities = allActivities.filter((activity, index, self) => 
          index === self.findIndex(a => a.id === activity.id)
        ).slice(0, 6);
        
        setSuggestedActivities(uniqueActivities);
      } catch (err) {
        console.error('Failed to fetch suggested activities:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestedActivities();
  }, [tripStops]);

  const handleTripDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setTripDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddStop = () => {
    setTripStops([...tripStops, { city: { id: '', name: '', country: selectedCountry }, start_date: '', end_date: '' }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // TODO: Replace with actual JWT token retrieval
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
      // 3. Navigate to Add Activities page
      navigate(`/trips/${tripId}/activities`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white/90 rounded-2xl shadow-lg mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-center tracking-tight">Plan a New Trip</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Details Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-4 shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Trip Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Trip Name (e.g. Japan Adventure)" className="p-3 border rounded-lg" value={tripDetails.name} onChange={handleTripDetailChange} required />
            <input name="cover_photo" placeholder="Cover Photo URL (optional)" className="p-3 border rounded-lg" value={tripDetails.cover_photo} onChange={handleTripDetailChange} />
            <input type="date" name="start_date" className="p-3 border rounded-lg" value={tripDetails.start_date} onChange={handleTripDetailChange} required />
            <input type="date" name="end_date" className="p-3 border rounded-lg" value={tripDetails.end_date} onChange={handleTripDetailChange} required />
          </div>
          <textarea name="description" placeholder="Describe your trip, goals, or vibe..." className="w-full p-3 border rounded-lg mt-4" value={tripDetails.description} onChange={handleTripDetailChange} required />
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="is_public" checked={tripDetails.is_public} onChange={handleTripDetailChange} />
            <span className="text-sm">Make this trip public</span>
          </div>
        </div>

        {/* Plan a New Trip Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-4 shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Plan a New Trip</h3>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Select a Country</label>
            <select className="w-full p-3 border rounded-lg" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required>
              <option value="">Choose a country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {selectedCountry && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Trip Stops (Cities)</span>
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition" onClick={handleAddStop}>+ Add City</button>
              </div>
              {tripStops.length === 0 && <div className="text-gray-400 italic mb-2">Add cities you plan to visit</div>}
              {tripStops.map((stop, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2 bg-white p-2 rounded-lg shadow-sm">
                  <select className="p-2 border rounded w-full md:w-auto" value={stop.city.id} onChange={e => handleCityChange(idx, e.target.value)} required>
                    <option value="">Select City</option>
                    {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                  </select>
                  <input type="date" className="p-2 border rounded w-full md:w-auto" value={stop.start_date} onChange={e => handleStopChange(idx, 'start_date', e.target.value)} required />
                  <input type="date" className="p-2 border rounded w-full md:w-auto" value={stop.end_date} onChange={e => handleStopChange(idx, 'end_date', e.target.value)} required />
                  <button type="button" className="text-red-500 hover:underline ml-2" onClick={() => handleRemoveStop(idx)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-4 shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Suggestions for Places to Visit / Activities</h3>
          {loadingSuggestions ? (
            <div className="flex justify-center items-center h-24">
              <div className="text-gray-500">Loading suggestions...</div>
            </div>
          ) : suggestedActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedActivities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
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
                        <span className="text-gray-500 text-sm">{activity.category}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mb-2 truncate">{activity.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 h-8 overflow-hidden">{activity.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {activity.category}
                    </span>
                    <span className="text-green-600 font-medium">
                      ${activity.min_cost} - ${activity.max_cost}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {activity.city.name}
                  </div>
                </div>
              ))}
            </div>
          ) : tripStops.length > 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No activities found for the selected cities.</p>
              <p className="text-sm mt-2">Try adding more cities to see suggestions!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Placeholder cards when no cities are selected */}
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Add cities to see suggestions</div>
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 2</div>
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 3</div>
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 4</div>
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 5</div>
              <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 6</div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold transition" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
