import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
}

const AddActivities: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [activities, setActivities] = useState<{ [stopId: string]: Activity[] }>({});
  const [selectedActivities, setSelectedActivities] = useState<{ [stopId: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!tripId) return;
    // Fetch trip details to get stops
    const user = localStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    axios.get(`http://localhost:3000/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setTripStops(res.data.data.tripStops);
        // For each stop, fetch activities for the city (assuming such an endpoint exists)
        res.data.data.tripStops.forEach((stop: TripStop) => {
          axios.get(`http://localhost:3000/api/locations/cities/${stop.city.id}/activities`)
            .then(aRes => {
              setActivities(prev => ({ ...prev, [stop.id]: aRes.data.data.activities }));
            })
            .catch(() => setActivities(prev => ({ ...prev, [stop.id]: [] })));
        });
      })
      .catch(() => setError('Failed to load trip stops'));
  }, [tripId]);

  const handleSelectActivity = (stopId: string, activityId: string, checked: boolean) => {
    setSelectedActivities(prev => {
      const prevList = prev[stopId] || [];
      if (checked) {
        return { ...prev, [stopId]: [...prevList, { activity_id: activityId, date: '', time: '', min_cost_override: '', max_cost_override: '' }] };
      } else {
        return { ...prev, [stopId]: prevList.filter(a => a.activity_id !== activityId) };
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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white/90 rounded-2xl shadow-lg mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-center tracking-tight">Add Activities to Your Trip</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-8">
        {tripStops.map(stop => (
          <div key={stop.id} className="mb-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-inner mb-2">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{stop.city.name}</span>
                <span className="text-gray-500 text-sm">{stop.start_date} to {stop.end_date}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activities[stop.id] || []).length === 0 ? (
                  <div className="text-gray-400 italic col-span-2">No activities found for this city.</div>
                ) : (
                  activities[stop.id].map(activity => {
                    const selected = (selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id);
                    return (
                      <div key={activity.id} className={`flex flex-col gap-2 p-4 rounded-lg border shadow-sm bg-white transition ${selected ? 'ring-2 ring-green-400' : ''}`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-green-600 w-5 h-5"
                            checked={!!selected}
                            onChange={e => handleSelectActivity(stop.id, activity.id, e.target.checked)}
                          />
                          <span className="font-medium text-lg">{activity.name}</span>
                          <span className="text-xs text-gray-500">({activity.category})</span>
                        </label>
                        <span className="text-xs text-gray-400 mb-1">{activity.description}</span>
                        {selected && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            <input type="date" className="p-2 border rounded" placeholder="Date" value={selected.date || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'date', e.target.value)} required />
                            <input type="time" className="p-2 border rounded" placeholder="Time" value={selected.time || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'time', e.target.value)} required />
                            <input type="number" className="p-2 border rounded" placeholder="Min Cost" value={selected.min_cost_override || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'min_cost_override', e.target.value)} min="0" />
                            <input type="number" className="p-2 border rounded" placeholder="Max Cost" value={selected.max_cost_override || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'max_cost_override', e.target.value)} min="0" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold transition" disabled={loading}>
          {loading ? 'Saving...' : 'Save Activities'}
        </button>
      </form>
    </div>
  );
};

export default AddActivities;
