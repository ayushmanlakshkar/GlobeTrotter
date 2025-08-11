import React from 'react';
import { Card } from './ui/card';
import { RegionalSelection } from '../services/trip.service';

interface RegionalCardProps {
  region: RegionalSelection;
  onClick?: () => void;
  className?: string;
}

const RegionalCard: React.FC<RegionalCardProps> = ({ region, onClick, className }) => {
  return (
    <Card 
      className={`cursor-pointer transition-transform hover:scale-105 ${className || ''}`}
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <img 
          src={region.image_url || 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
          alt={region.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
          <h3 className="text-white font-medium text-sm">{region.name}</h3>
        </div>
      </div>
    </Card>
  );
};

export default RegionalCard;
