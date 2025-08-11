import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import travelPattern from '../assets/travel-pattern';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <Layout headerVariant="landing" className="flex flex-col bg-white relative overflow-hidden">
      {/* Background element for top half only */}
      <div 
        className="absolute top-0 left-0 w-full h-5/6 z-0"
        style={{
          backgroundImage: 'url(https://media.cntraveller.com/photos/66dab99cca79963e5f03ff9d/4:3/w_4256,h_3192,c_limit/GettyImages-1588291549.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 z-20 relative">
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
      
      <div className="absolute bottom-0 left-0 w-full z-10 opacity-30">
        <div className="w-full" dangerouslySetInnerHTML={{ __html: travelPattern }} />
      </div>
    </Layout>
  );
};

export default Landing;
