import React from 'react';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  maxValue, 
  height = 200, 
  showValues = true 
}) => {
  console.log('BarChart received data:', data);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available for chart
      </div>
    );
  }

  const max = maxValue || Math.max(...data.map(d => d.value)) || 1;
  const colors = [
    'bg-gradient-to-t from-blue-500 to-blue-400',
    'bg-gradient-to-t from-purple-500 to-purple-400',
    'bg-gradient-to-t from-green-500 to-green-400',
    'bg-gradient-to-t from-yellow-500 to-yellow-400',
    'bg-gradient-to-t from-red-500 to-red-400',
    'bg-gradient-to-t from-indigo-500 to-indigo-400',
    'bg-gradient-to-t from-pink-500 to-pink-400',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 40);
          const colorClass = item.color || colors[index % colors.length];
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="relative flex items-end" style={{ height: `${height - 40}px` }}>
                {showValues && item.value > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {item.value}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-lg shadow-lg ${colorClass} transition-all duration-700 ease-out hover:scale-105`}
                  style={{ 
                    height: `${barHeight}px`,
                    minHeight: item.value > 0 ? '4px' : '0px'
                  }}
                />
              </div>
              <div className="mt-3 text-xs font-medium text-gray-600 text-center max-w-full">
                <div className="truncate">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
