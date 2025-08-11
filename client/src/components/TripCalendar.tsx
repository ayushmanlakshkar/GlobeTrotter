import React, { useState, useEffect } from 'react';
import { CalendarService, CalendarTrip } from '../services/calendar.service';
import './TripCalendar.css';

interface TripCalendarProps {
  authToken: string;
}

const TripCalendar: React.FC<TripCalendarProps> = ({ authToken }) => {
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

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

    return (
      <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
        <div className="day-number">{day}</div>
        <div className="day-trips">
          {dayTrips.map((trip, index) => (
            <div 
              key={`${trip.id}-${index}`} 
              className={`trip-item ${trip.is_public ? 'public' : 'private'}`}
              title={`${trip.name} - ${trip.destinations}`}
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
