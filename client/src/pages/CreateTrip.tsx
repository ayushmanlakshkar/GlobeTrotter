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
      const token = localStorage.getItem('jwt_token');
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create a New Trip</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Trip Name" className="w-full p-2 border rounded" value={tripDetails.name} onChange={handleTripDetailChange} required />
        <textarea name="description" placeholder="Description" className="w-full p-2 border rounded" value={tripDetails.description} onChange={handleTripDetailChange} required />
        <div className="flex gap-2">
          <input type="date" name="start_date" className="p-2 border rounded" value={tripDetails.start_date} onChange={handleTripDetailChange} required />
          <input type="date" name="end_date" className="p-2 border rounded" value={tripDetails.end_date} onChange={handleTripDetailChange} required />
        </div>
        <input name="cover_photo" placeholder="Cover Photo URL" className="w-full p-2 border rounded" value={tripDetails.cover_photo} onChange={handleTripDetailChange} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_public" checked={tripDetails.is_public} onChange={handleTripDetailChange} />
          Public Trip
        </label>
        <div>
          <label className="block mb-1 font-semibold">Country</label>
          <select className="w-full p-2 border rounded" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required>
            <option value="">Select Country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {selectedCountry && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Trip Stops (Cities)</span>
              <button type="button" className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddStop}>+ Add City</button>
            </div>
            {tripStops.map((stop, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <select className="p-2 border rounded" value={stop.city.id} onChange={e => handleCityChange(idx, e.target.value)} required>
                  <option value="">Select City</option>
                  {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
                <input type="date" className="p-2 border rounded" value={stop.start_date} onChange={e => handleStopChange(idx, 'start_date', e.target.value)} required />
                <input type="date" className="p-2 border rounded" value={stop.end_date} onChange={e => handleStopChange(idx, 'end_date', e.target.value)} required />
                <button type="button" className="text-red-500" onClick={() => handleRemoveStop(idx)}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Trip'}</button>
      </form>
    </div>
  );
};

export default CreateTrip;
