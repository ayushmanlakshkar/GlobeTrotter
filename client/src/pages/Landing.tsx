import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoSvg from '../assets/logo';
import travelPattern from '../assets/travel-pattern';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative overflow-hidden">
      <div className="flex justify-between items-center px-6 md:px-16 py-5 z-10 relative">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3" dangerouslySetInnerHTML={{ __html: logoSvg }} />
          <h1 className="text-2xl font-bold text-primary">GlobeTrotter</h1>
        </div>
        <div className="flex gap-4">
          <button 
            className="font-semibold text-primary hover:underline" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="px-5 py-2.5 rounded-full font-semibold bg-primary text-white hover:bg-primary-dark transition-colors" 
            onClick={() => navigate('/signup')}
          >
            Sign up free
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 z-10 relative">
        <div className="text-center max-w-3xl mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-1">One travel app</h1>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-5">to replace them all</h1>
          <p className="text-lg text-primary max-w-2xl mx-auto mb-8">
            Streamline every aspect of your trip - from itinerary planning and
            travel budgeting to packing and wanderlust sharing.
          </p>
          <button 
            className="px-8 py-4 rounded-full text-lg font-semibold bg-primary text-white hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={handleGetStarted}
          >
            Get started. It's FREE
          </button>
        </div>
        
        <div className="flex justify-center flex-wrap gap-10 mt-10">
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">📝</div>
            <span className="text-primary font-medium">Planner</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">✓</div>
            <span className="text-primary font-medium">Checklist</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">👤</div>
            <span className="text-primary font-medium">Profile</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">📄</div>
            <span className="text-primary font-medium">Documents</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">💰</div>
            <span className="text-primary font-medium">Budget</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">📔</div>
            <span className="text-primary font-medium">Journal</span>
          </div>
          <div className="flex flex-col items-center text-center w-24">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-2xl text-primary">📸</div>
            <span className="text-primary font-medium">Travel reels</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full z-1 opacity-30">
        <div className="w-full" dangerouslySetInnerHTML={{ __html: travelPattern }} />
      </div>
    </div>
  );
};

export default Landing;
