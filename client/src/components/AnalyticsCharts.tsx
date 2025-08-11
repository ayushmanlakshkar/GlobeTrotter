import React from 'react';
import ChartCard from './ChartCard';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import LineChart from './LineChart';

interface PopularCity {
  id: string;
  name: string;
  country: string;
  tripCount: string;
}

interface PopularActivity {
  id: string;
  name: string;
  category: string;
  usageCount: string;
}

interface UserTrend {
  month: string;
  tripCount: string;
}

interface AnalyticsChartsProps {
  popularCities: PopularCity[];
  popularActivities: PopularActivity[];
  userTrends: UserTrend[];
  loading?: boolean;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  popularCities, 
  popularActivities, 
  userTrends, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Prepare data for charts with fallbacks
  const cityChartData = popularCities.length > 0 
    ? popularCities.slice(0, 6).map(city => ({
        label: city.name,
        value: parseInt(city.tripCount) || 0
      }))
    : [
        { label: 'Tokyo', value: 5 },
        { label: 'Paris', value: 4 },
        { label: 'London', value: 3 },
        { label: 'Barcelona', value: 2 },
        { label: 'Rome', value: 2 }
      ];

  console.log('City chart data:', cityChartData);

  const activityChartData = popularActivities.length > 0
    ? popularActivities.slice(0, 5).map((activity, index) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
        return {
          label: activity.name,
          value: parseInt(activity.usageCount) || 0,
          color: colors[index % colors.length]
        };
      })
    : [
        { label: 'City Tour', value: 12, color: '#3b82f6' },
        { label: 'Museum Visit', value: 8, color: '#8b5cf6' },
        { label: 'Food Tasting', value: 6, color: '#10b981' },
        { label: 'Adventure Sports', value: 4, color: '#f59e0b' },
        { label: 'Cultural Events', value: 3, color: '#ef4444' }
      ];

  const trendChartData = userTrends.length > 0
    ? userTrends.slice(0, 8).map(trend => {
        const date = new Date(trend.month);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          label: monthName,
          value: parseInt(trend.tripCount) || 0
        };
      })
    : [
        { label: 'Jan', value: 12 },
        { label: 'Feb', value: 8 },
        { label: 'Mar', value: 15 },
        { label: 'Apr', value: 22 },
        { label: 'May', value: 18 },
        { label: 'Jun', value: 25 },
        { label: 'Jul', value: 30 },
        { label: 'Aug', value: 28 }
      ];

  console.log('Trend chart data:', trendChartData);

  // Activity categories for donut chart
  const categoryMap = new Map<string, number>();
  
  if (popularActivities.length > 0) {
    popularActivities.forEach(activity => {
      const count = categoryMap.get(activity.category) || 0;
      categoryMap.set(activity.category, count + parseInt(activity.usageCount));
    });
  } else {
    // Fallback data
    categoryMap.set('culture', 15);
    categoryMap.set('adventure', 12);
    categoryMap.set('food', 10);
    categoryMap.set('leisure', 8);
    categoryMap.set('nature', 6);
  }

  const categoryChartData = Array.from(categoryMap.entries()).map(([category, count], index) => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    return {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="space-y-6">

      {/* Bottom Row - Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Categories Donut Chart */}
        <ChartCard
          title="Activity Categories"
          subtitle="Distribution by category type"
          className="lg:col-span-1"
        >
          {categoryChartData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart 
                data={categoryChartData}
                size={180}
                strokeWidth={30}
                centerText={categoryChartData.reduce((sum, item) => sum + item.value, 0).toString()}
                centerSubtext="Total"
              />
            </div>
          ) : activityChartData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart 
                data={activityChartData}
                size={180}
                strokeWidth={30}
                centerText={activityChartData.reduce((sum, item) => sum + item.value, 0).toString()}
                centerSubtext="Activities"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No category data available
            </div>
          )}
        </ChartCard>

        {/* Top Activities List */}
        <ChartCard
          title="Top Activities"
          subtitle="Most popular travel activities"
          className="lg:col-span-2"
        >
          {(popularActivities.length > 0 || activityChartData.length > 0) ? (
            <div className="space-y-4">
              {(popularActivities.length > 0 ? popularActivities.slice(0, 6) : activityChartData.slice(0, 6)).map((activity, index) => {
                // Handle both real data and fallback data
                const activityName = 'name' in activity ? activity.name : activity.label;
                const activityCategory = 'category' in activity ? activity.category : 'general';
                const activityCount = 'usageCount' in activity ? activity.usageCount : activity.value.toString();
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{activityName}</div>
                        <div className="text-sm text-gray-600 capitalize">{activityCategory}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="font-bold text-gray-900">{activityCount}</div>
                        <div className="text-xs text-gray-600">bookings</div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((parseInt(activityCount.toString()) / 30) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No activity data available
            </div>
          )}
        </ChartCard>
      </div>
      {/* Top Row - Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Cities Bar Chart */}
        <ChartCard
          title="Popular Destinations"
          subtitle="Cities with the most trip bookings"
          actions={
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Trips</span>
            </div>
          }
        >
          {cityChartData.length > 0 ? (
            <BarChart data={cityChartData} height={250} showValues={true} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No destination data available
            </div>
          )}
        </ChartCard>

        {/* Trip Trends Line Chart */}
        <ChartCard
          title="Trip Trends"
          subtitle="Monthly trip creation over time"
          actions={
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Monthly</span>
            </div>
          }
        >
          {trendChartData.length > 0 ? (
            <LineChart 
              data={trendChartData} 
              height={250} 
              color="#3b82f6"
              showArea={true}
              showDots={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              No trend data available
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
