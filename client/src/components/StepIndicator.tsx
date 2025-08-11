import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 border-2 z-10 bg-white
                  ${isCompleted 
                    ? 'border-green-500 bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200' 
                    : 'border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div
                className={`
                  mt-3 text-sm font-medium text-center px-2
                  ${isCurrent 
                    ? 'text-blue-600' 
                    : isCompleted 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                  }
                `}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
