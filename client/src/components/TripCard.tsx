import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
      className={`cursor-pointer transition-transform hover:scale-105 ${className || ''}`}
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={trip.image_url || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
          alt={trip.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary">{trip.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2">
          {trip.description || 'No description available'}
        </p>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatDate(trip.start_date)}</span>
          {trip.end_date && <span>to {formatDate(trip.end_date)}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
