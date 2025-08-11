import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import logoSvg from '../assets/logo';

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 mr-2 cursor-pointer" 
              dangerouslySetInnerHTML={{ __html: logoSvg }} 
              onClick={() => navigate('/dashboard')}
            />
            <h1 className="text-xl font-bold text-primary">GlobeTrotter</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Plan a New Trip</h1>
          
          {/* Placeholder for trip creation form */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center py-12">
              Trip creation form will be implemented here.
            </p>

            <div className="flex justify-end mt-6 gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button onClick={() => navigate('/dashboard')}>Create Trip</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTrip;
