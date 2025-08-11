import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SearchBar } from '../components/ui/search-bar';
import TripCard from '../components/TripCard';
import RegionalCard from '../components/RegionalCard';
import logoSvg from '../assets/logo';
import authService from '../services/auth.service';
import tripService, { Trip, RegionalSelection } from '../services/trip.service';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<RegionalSelection[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('date');

  useEffect(() => {
    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [regionsRes, previousTripsRes, upcomingTripsRes] = await Promise.all([
          tripService.getRegionalSelections(),
          tripService.getPreviousTrips(),
          tripService.getUpcomingTrips()
        ]);
        
        setRegions(regionsRes.data || []);
        console.log('Fetched regions:', regionsRes.data);
        setPreviousTrips(previousTripsRes.data.trips || []);
        console.log('Fetched previous trips:', previousTripsRes);
        setUpcomingTrips(upcomingTripsRes.data || []);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCreateTrip = () => {
    navigate('/trips/create');
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/trips/${tripId}`);
  };
  
  const handleRegionClick = (regionId: string) => {
    navigate(`/regions/${regionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2" dangerouslySetInnerHTML={{ __html: logoSvg }} />
            <h1 className="text-xl font-bold text-primary">GlobeTrotter</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Banner */}
        <div className="relative h-48 rounded-lg mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
            <h2 className="text-white text-4xl font-bold">Banner Image</h2>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="flex-grow max-w-xl">
            <SearchBar 
              placeholder="Search for destinations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Group by:</span>
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="date">Date</option>
              <option value="region">Region</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          <Button variant="outline">Filter</Button>
          <Button>Sort by...</Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Top Regional Selections */}
            {/* <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Top Regional Selections</h2>
                <Button variant="link">View all</Button>
              </div>
              
              
            </section> */}

            {/* Previous Trips */}
            {previousTrips.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Previous Trips</h2>
                  <Button variant="link">View all</Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {previousTrips.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onClick={() => handleTripClick(trip.id)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Upcoming Trips</h2>
                  <Button variant="link">View all</Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {upcomingTrips.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onClick={() => handleTripClick(trip.id)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Trips Placeholder */}
            {previousTrips.length === 0 && upcomingTrips.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-600 mb-4">You haven't created any trips yet</h3>
                <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
                <Button onClick={handleCreateTrip} size="lg">
                  Create your first trip
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 h-14">
        <Button 
          onClick={handleCreateTrip}
          className="rounded-full h-14 w-auto shadow-lg"
        >
          <Plus className="h-6 w-6" /> Plan A Trip
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
