import React from 'react';
import { Card, CardContent } from './ui/card';
import { Trip } from '../services/trip.service';
import { formatDate } from '../utils/date-formatter';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  className?: string;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick, className }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm ${className || ''}`}
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={trip.image_url || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
          alt={trip.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-bold leading-tight line-clamp-2">{trip.name}</h3>
        </div>
      </div>
      <CardContent className="p-5">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {trip.description || 'Discover amazing places and create unforgettable memories on this incredible journey.'}
        </p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">{formatDate(trip.start_date)}</span>
          </div>
          {trip.end_date && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="font-medium">{formatDate(trip.end_date)}</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
