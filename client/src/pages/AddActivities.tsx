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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Activities to Your Trip</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {tripStops.map(stop => (
          <div key={stop.id} className="border-b pb-4 mb-4">
            <h3 className="font-semibold mb-2">{stop.city.name} ({stop.start_date} to {stop.end_date})</h3>
            <div className="space-y-2">
              {(activities[stop.id] || []).length === 0 ? (
                <div className="text-gray-500">No activities found for this city.</div>
              ) : (
                activities[stop.id].map(activity => (
                  <div key={activity.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!(selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id)}
                      onChange={e => handleSelectActivity(stop.id, activity.id, e.target.checked)}
                    />
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-xs text-gray-500">({activity.category})</span>
                    <span className="text-xs text-gray-400">{activity.description}</span>
                    { (selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id) && (
                      <div className="flex gap-1 ml-4">
                        <input type="date" className="p-1 border rounded" placeholder="Date" value={(selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id)?.date || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'date', e.target.value)} required />
                        <input type="time" className="p-1 border rounded" placeholder="Time" value={(selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id)?.time || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'time', e.target.value)} required />
                        <input type="number" className="p-1 border rounded" placeholder="Min Cost" value={(selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id)?.min_cost_override || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'min_cost_override', e.target.value)} min="0" />
                        <input type="number" className="p-1 border rounded" placeholder="Max Cost" value={(selectedActivities[stop.id] || []).find(a => a.activity_id === activity.id)?.max_cost_override || ''} onChange={e => handleActivityDetailChange(stop.id, activity.id, 'max_cost_override', e.target.value)} min="0" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save Activities'}</button>
      </form>
    </div>
  );
};

export default AddActivities;
