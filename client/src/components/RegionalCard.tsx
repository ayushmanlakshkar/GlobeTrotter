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
      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm group ${className || ''}`}
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={region.image_url || 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
          alt={region.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold mb-2">{region.name}</h3>
            <div className="w-12 h-0.5 bg-white/60 mx-auto"></div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RegionalCard;
