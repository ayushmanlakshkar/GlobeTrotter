import React, { useState, useEffect } from 'react';
import { 
  CalendarService, 
  CalendarTrip, 
  YearlyOverviewResponse, 
  MonthlyOverview 
} from '../services/calendar.service';
import { authHeader } from '../utils/auth-header';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Eye, 
  EyeOff,
  Filter,
  Download,
  Grid,
  List,
  BarChart3
} from 'lucide-react';

interface CalendarPageProps {}

const Calendar: React.FC<CalendarPageProps> = () => {
  // State for calendar data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<CalendarTrip[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for view controls
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'list'>('month');
  const [showPrivateTrips, setShowPrivateTrips] = useState(true);
  const [showPublicTrips, setShowPublicTrips] = useState(true);
  
  // Calendar service instance
  const [calendarService, setCalendarService] = useState<CalendarService | null>(null);

  // Initialize calendar service with auth token
  useEffect(() => {
    const headers = authHeader();
    const token = headers.Authorization?.replace('Bearer ', '') || '';
    if (token) {
      setCalendarService(new CalendarService('http://localhost:3000/api', token));
    }
  }, []);

  // Load data when service is ready or date changes
  useEffect(() => {
    if (calendarService) {
      loadCalendarData();
    }
  }, [calendarService, currentDate, viewMode]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calendar constants
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get calendar grid info
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const loadCalendarData = async () => {
    if (!calendarService) return;

    setLoading(true);
    setError(null);
    
    try {
      if (viewMode === 'month') {
        const response = await calendarService.getTripsForMonth(currentYear, currentMonth + 1);
        if (response.success) {
          setTrips(response.data.trips);
        } else {
          setError('Failed to load calendar data');
        }
      } else if (viewMode === 'year') {
        const response = await calendarService.getYearlyOverview(currentYear);
        if (response.success) {
          setYearlyData(response);
        } else {
          setError('Failed to load yearly overview');
        }
      } else if (viewMode === 'list') {
        // Load all trips for the year
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;
        const response = await calendarService.getTripsForDateRange(startDate, endDate);
        if (response.success) {
          setTrips(response.data.trips);
        } else {
          setError('Failed to load trip list');
        }
      }
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const getTripsForDate = (day: number): CalendarTrip[] => {
    if (!trips || !Array.isArray(trips)) {
      return [];
    }
    const targetDate = new Date(currentYear, currentMonth, day);
    return trips.filter(trip => {
      if (!trip || !trip.start_date || !trip.end_date) {
        return false;
      }
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const isInRange = targetDate >= startDate && targetDate <= endDate;
      const isVisible = (showPublicTrips && trip.is_public) || (showPrivateTrips && !trip.is_public);
      return isInRange && isVisible;
    });
  };

  const getFilteredTrips = (): CalendarTrip[] => {
    if (!trips || !Array.isArray(trips)) {
      return [];
    }
    return trips.filter(trip => 
      trip && ((showPublicTrips && trip.is_public) || (showPrivateTrips && !trip.is_public))
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTripStatusColor = (trip: CalendarTrip): string => {
    if (trip.status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (trip.status === 'confirmed') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (trip.status === 'planning') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (trip.status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderCalendarDay = (day: number) => {
    const dayTrips = getTripsForDate(day);
    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
    const hasTrips = dayTrips.length > 0;

    return (
      <div 
        key={day} 
        className={`
          relative min-h-[120px] p-2 border border-gray-200 bg-white
          ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${hasTrips ? 'bg-gradient-to-br from-white to-blue-50' : ''}
          hover:bg-gray-50 transition-colors cursor-pointer
        `}
      >
        <div className={`
          text-sm font-medium mb-2 
          ${isToday ? 'text-blue-700' : 'text-gray-700'}
        `}>
          {day}
        </div>
        
        <div className="space-y-1">
          {dayTrips.slice(0, 3).map((trip, index) => (
            <div 
              key={`${trip.id}-${index}`} 
              className={`
                text-xs p-1 rounded border truncate
                ${trip.is_public 
                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                  : 'bg-purple-100 text-purple-800 border-purple-200'
                }
              `}
              title={`${trip.name} - ${trip.destinations || 'No destinations'}`}
            >
              {trip.name}
            </div>
          ))}
          
          {dayTrips.length > 3 && (
            <div className="text-xs text-gray-500 font-medium">
              +{dayTrips.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderCalendarDay(day));
    }
    
    return days;
  };

  const renderMonthView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button 
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {renderCalendarGrid()}
      </div>
    </div>
  );

  const renderYearView = () => {
    if (!yearlyData) return null;

    return (
      <div className="space-y-6">
        {/* Year header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigateYear('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800">{currentYear}</h2>
            
            <button 
              onClick={() => navigateYear('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Year stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{yearlyData.data.yearly_summary.total_trips} trips</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{yearlyData.data.yearly_summary.total_travel_days} days</span>
            </div>
          </div>
        </div>

        {/* Monthly grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {yearlyData.data.monthly_overview.map((month: MonthlyOverview) => (
            <div 
              key={month.month}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setCurrentDate(new Date(currentYear, month.month - 1, 1));
                setViewMode('month');
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{month.month_name}</h3>
                <span className="text-sm text-gray-500">{month.trip_count} trips</span>
              </div>
              
              <div className="space-y-2">
                {month.trips.slice(0, 3).map((trip) => (
                  <div 
                    key={trip.id}
                    className="text-xs p-2 bg-blue-50 rounded border border-blue-200 text-blue-800"
                  >
                    <div className="font-medium truncate">{trip.name}</div>
                    <div className="text-blue-600">{trip.destinations || 'No destinations'}</div>
                  </div>
                ))}
                
                {month.trips.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{month.trips.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const filteredTrips = getFilteredTrips().sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">All Trips {currentYear}</h2>
          <div className="text-sm text-gray-600">
            {filteredTrips.length} trips found
          </div>
        </div>

        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <div 
              key={trip.id}
              className={`
                bg-white rounded-lg border p-4 hover:shadow-md transition-shadow
                ${getTripStatusColor(trip)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{trip.name}</h3>
                    <div className="flex items-center space-x-2">
                      {trip.is_public ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {trip.status || 'planning'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{trip.duration_days || 0} days</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destinations || 'No destinations'}</span>
                  </div>
                  
                  {trip.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>
                
                {trip.cover_photo && (
                  <img 
                    src={trip.cover_photo}
                    alt={trip.name}
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
            </div>
          ))}
          
          {filteredTrips.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No trips found for {currentYear}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!calendarService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Travel Calendar
              </h1>
              <p className="text-gray-600 mt-1">Plan and track your adventures</p>
            </div>

            {/* Export button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View mode selector */}
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'month' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <Grid className="w-4 h-4" />
                <span>Month</span>
              </button>
              
              <button
                onClick={() => setViewMode('year')}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'year' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Year</span>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Show:</span>
              </div>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPublicTrips}
                  onChange={(e) => setShowPublicTrips(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Public</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrivateTrips}
                  onChange={(e) => setShowPrivateTrips(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Private</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'year' && renderYearView()}
            {viewMode === 'list' && renderListView()}
          </>
        )}

        {/* Stats footer */}
        {viewMode === 'month' && !loading && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Month Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getFilteredTrips().length}
                </div>
                <div className="text-sm text-gray-600">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getFilteredTrips().reduce((sum, trip) => sum + (trip.duration_days || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Travel Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(getFilteredTrips().flatMap(trip => 
                    trip.destinations ? trip.destinations.split(', ') : []
                  )).size}
                </div>
                <div className="text-sm text-gray-600">Destinations</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
