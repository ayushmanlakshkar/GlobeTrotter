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

  const handleTripDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Placeholder cards for suggestions */}
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 1</div>
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 2</div>
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 3</div>
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 4</div>
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 5</div>
            <div className="h-24 bg-white rounded-lg border flex items-center justify-center text-gray-400">Suggestion 6</div>
          </div>
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold transition" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
