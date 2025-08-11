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
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setCurrentUser(user);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center" dangerouslySetInnerHTML={{ __html: logoSvg }} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GlobeTrotter</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/calendar')}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Calendar
            </Button>
            {currentUser?.user?.role === 'admin' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Banner */}
        <div className="relative h-80 rounded-3xl mb-12 overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          <div className="relative z-10 h-full flex items-center px-12">
            <div className="text-white max-w-2xl">
              <h2 className="text-5xl font-bold mb-4 leading-tight">Welcome Back,<br />Explorer</h2>
              <p className="text-xl opacity-90 mb-6">Ready to discover your next unforgettable destination?</p>
              <Button 
                onClick={handleCreateTrip}
                size="xl"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Planning
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-12 shadow-lg border border-white/20">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex-grow max-w-2xl">
              <SearchBar 
                placeholder="Search destinations, trips, or activities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-2">
                <span className="text-sm font-medium text-gray-700">Group by:</span>
                <select 
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="region">Region</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
              <Button variant="outline" className="h-10 px-6 bg-white/80 border-gray-200 hover:bg-white">Filter</Button>
              <Button className="h-10 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Sort</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 font-medium">Loading your adventures...</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 bg-red-50/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Top Regional Selections */}
            {regions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Amazing Destinations</h2>
                    <p className="text-gray-600">Popular regions waiting to be explored</p>
                  </div>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Explore all →
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {regions.slice(0, 6).map((region) => (
                    <div key={region.id} className="group">
                      <RegionalCard 
                        region={region} 
                        onClick={() => handleRegionClick(region.id)}
                        className="hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Previous Trips */}
            {previousTrips.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Journey History</h2>
                    <p className="text-gray-600">Relive your amazing adventures</p>
                  </div>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 font-semibold">
                    View all →
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {previousTrips.map((trip) => (
                    <div key={trip.id} className="group">
                      <TripCard 
                        trip={trip} 
                        onClick={() => handleTripClick(trip.id)}
                        className="hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Upcoming Adventures</h2>
                    <p className="text-gray-600">Get ready for your next journey</p>
                  </div>
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 font-semibold">
                    View all →
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="group relative">
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Upcoming
                        </div>
                      </div>
                      <TripCard 
                        trip={trip} 
                        onClick={() => handleTripClick(trip.id)}
                        className="hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Trips Placeholder */}
            {previousTrips.length === 0 && upcomingTrips.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-xl border border-white/20">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Plus className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready for Your First Adventure?</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Create your first trip and let us help you plan the perfect getaway. From hidden gems to popular destinations, your journey starts here.</p>
                  <Button 
                    onClick={handleCreateTrip} 
                    size="xl"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Trip
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={handleCreateTrip}
          className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110 transition-all duration-300 group"
        >
          <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
