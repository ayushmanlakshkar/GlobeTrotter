import React, { useState, useEffect } from 'react';
import { CalendarService, CalendarTrip } from '../services/calendar.service';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Eye, EyeOff } from 'lucide-react';

interface TripCalendarProps {
  authToken: string;
  className?: string;
  onTripClick?: (trip: CalendarTrip) => void;
  compact?: boolean;
}

const TripCalendar: React.FC<TripCalendarProps> = ({ 
  authToken, 
  className = '',
  onTripClick,
  compact = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<CalendarTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarService] = useState(new CalendarService('http://localhost:3000/api', authToken));

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first day of month and days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = compact ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadTripsForMonth();
  }, [currentDate]);

  const loadTripsForMonth = async () => {
    setLoading(true);
    try {
      const response = await calendarService.getTripsForMonth(currentYear, currentMonth + 1);
      if (response.success) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
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

  const getTripsForDate = (day: number): CalendarTrip[] => {
    const targetDate = new Date(currentYear, currentMonth, day);
    return trips.filter(trip => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  const renderCalendarDay = (day: number) => {
    const dayTrips = getTripsForDate(day);
    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
    const hasTrips = dayTrips.length > 0;

    const dayHeight = compact ? 'min-h-[60px]' : 'min-h-[100px]';
    const displayLimit = compact ? 1 : 2;

    return (
      <div 
        key={day} 
        className={`
          relative ${dayHeight} p-1 border border-gray-200 bg-white transition-colors
          ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${hasTrips ? 'bg-gradient-to-br from-white to-blue-50' : ''}
          hover:bg-gray-50 cursor-pointer
          ${compact ? 'text-xs' : 'text-sm'}
        `}
      >
        <div className={`
          font-medium mb-1
          ${isToday ? 'text-blue-700' : 'text-gray-700'}
          ${compact ? 'text-xs' : 'text-sm'}
        `}>
          {day}
        </div>
        
        <div className="space-y-1">
          {dayTrips.slice(0, displayLimit).map((trip, index) => (
            <div 
              key={`${trip.id}-${index}`} 
              className={`
                text-xs p-1 rounded border truncate cursor-pointer transition-colors
                ${trip.is_public 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
                  : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                }
                ${compact ? 'text-xs px-1 py-0.5' : ''}
              `}
              title={`${trip.name} - ${trip.destinations}`}
              onClick={(e) => {
                e.stopPropagation();
                onTripClick?.(trip);
              }}
            >
              <div className="flex items-center space-x-1">
                {trip.is_public ? (
                  <Eye className="w-2 h-2 flex-shrink-0" />
                ) : (
                  <EyeOff className="w-2 h-2 flex-shrink-0" />
                )}
                <span className="truncate">{trip.name}</span>
              </div>
            </div>
          ))}
          
          {dayTrips.length > displayLimit && (
            <div className={`text-gray-500 font-medium ${compact ? 'text-xs' : 'text-xs'}`}>
              +{dayTrips.length - displayLimit} more
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
      const dayHeight = compact ? 'min-h-[60px]' : 'min-h-[100px]';
      days.push(
        <div key={`empty-${i}`} className={`${dayHeight} bg-gray-50 border border-gray-200`}></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderCalendarDay(day));
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <ChevronLeft className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </button>
        
        <h2 className={compact ? "text-sm font-semibold" : "text-lg font-bold"}>
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button 
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <ChevronRight className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map(day => (
          <div 
            key={day} 
            className={`
              p-2 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0
              ${compact ? 'text-xs py-1' : 'text-sm py-3'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {renderCalendarGrid()}
      </div>

      {/* Stats footer */}
      {!compact && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{trips.length} trips this month</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{trips.reduce((sum, trip) => sum + trip.duration_days, 0)} travel days</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Public</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Private</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCalendar;
            >
              <span className="trip-name">{trip.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderCalendarDay(day));
    }
    
    return days;
  };

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  return (
    <div className="trip-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>GlobeTrotter</h2>
        </div>
        <div className="calendar-controls">
          <input type="text" placeholder="Search bar ......" className="search-bar" />
          <button className="group-by-btn">Group by</button>
          <button className="filter-btn">Filter</button>
          <button className="sort-btn">Sort by...</button>
        </div>
      </div>

      {/* Calendar View Title */}
      <div className="calendar-view-title">
        <h3>Calendar View</h3>
      </div>

      {/* Month Navigation */}
      <div className="month-navigation">
        <button onClick={() => navigateMonth('prev')} className="nav-button">
          &lt;
        </button>
        <h3 className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button onClick={() => navigateMonth('next')} className="nav-button">
          &gt;
        </button>
      </div>

      {/* Week Days Header */}
      <div className="week-header">
        {weekDays.map(day => (
          <div key={day} className="week-day">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {renderCalendarGrid()}
      </div>

      {/* Trip Stats */}
      <div className="calendar-stats">
        <div className="stats-item">
          <span className="stats-label">Trips this month:</span>
          <span className="stats-value">{trips.length}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Travel days:</span>
          <span className="stats-value">
            {trips.reduce((sum, trip) => sum + trip.duration_days, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripCalendar;
