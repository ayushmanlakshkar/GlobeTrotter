import React, { useState, useEffect } from 'react';
import { 
  LocationService, 
  City, 
  Activity,
  ActivityCategory,
  CitySearchParams,
  ActivitySearchParams,
  PaginationInfo
} from '../services/location.service';
import { authHeader } from '../utils/auth-header';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign,
  Clock,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Loader,
  Tag,
  Building,
  Globe
} from 'lucide-react';

interface CombinedSearchProps {}

const CombinedSearch: React.FC<CombinedSearchProps> = () => {
  // State for location service
  const [locationService, setLocationService] = useState<LocationService | null>(null);
  
  // State for search mode
  const [searchMode, setSearchMode] = useState<'cities' | 'activities'>('cities');
  
  // State for cities data
  const [cities, setCities] = useState<City[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [cityPagination, setCityPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // State for activities data
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | ''>('');
  const [minCost, setMinCost] = useState<number | ''>('');
  const [maxCost, setMaxCost] = useState<number | ''>('');
  const [citySortBy, setCitySortBy] = useState<CitySearchParams['sortBy']>('name');
  const [citySortOrder, setCitySortOrder] = useState<CitySearchParams['sortOrder']>('ASC');
  const [activitySortBy, setActivitySortBy] = useState<ActivitySearchParams['sortBy']>('name');
  const [activitySortOrder, setActivitySortOrder] = useState<ActivitySearchParams['sortOrder']>('ASC');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize location service
  useEffect(() => {
    const headers = authHeader();
    const token = headers.Authorization?.replace('Bearer ', '') || '';
    if (token) {
      setLocationService(new LocationService('http://localhost:3000/api', token));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (locationService) {
      loadCountries();
      loadPopularCities();
      loadAllCities();
      loadData();
    }
  }, [locationService]);

  // Load data when search parameters change
  useEffect(() => {
    if (locationService) {
      loadData();
    }
  }, [locationService, searchMode, searchQuery, selectedCountry, selectedCityId, selectedCategory, minCost, maxCost, citySortBy, citySortOrder, activitySortBy, activitySortOrder, cityPagination.page]);

  const loadCountries = async () => {
    if (!locationService) return;
    
    try {
      const response = await locationService.getCountries();
      if (response.success) {
        setCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadPopularCities = async () => {
    if (!locationService) return;
    
    try {
      const response = await locationService.getPopularCities(8);
      if (response.success) {
        setPopularCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error loading popular cities:', error);
    }
  };

  const loadAllCities = async () => {
    if (!locationService) return;
    
    try {
      const response = await locationService.getCities({ limit: 100, sortBy: 'popularity', sortOrder: 'DESC' });
      if (response.success) {
        setAllCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error loading all cities:', error);
    }
  };

  const loadData = async () => {
    if (!locationService) return;

    setLoading(true);
    setError(null);

    try {
      if (searchMode === 'cities') {
        await loadCities();
      } else {
        await loadActivities();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    if (!locationService) return;

    const params: CitySearchParams = {
      page: cityPagination.page,
      limit: cityPagination.limit,
      sortBy: citySortBy,
      sortOrder: citySortOrder,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedCountry) {
      params.country = selectedCountry;
    }

    const response = await locationService.getCities(params);
    
    if (response.success) {
      setCities(response.data.cities);
      setCityPagination(response.data.pagination);
    } else {
      setError(response.error || 'Failed to load cities');
    }
  };

  const loadActivities = async () => {
    if (!locationService) return;

    const params: ActivitySearchParams = {
      limit: 100,
      sortBy: activitySortBy,
      sortOrder: activitySortOrder,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedCityId) {
      params.cityId = selectedCityId;
    }

    if (selectedCategory) {
      params.category = selectedCategory;
    }

    if (minCost !== '') {
      params.min_cost = Number(minCost);
    }

    if (maxCost !== '') {
      params.max_cost = Number(maxCost);
    }

    const response = await locationService.getActivities(params);
    
    if (response.success) {
      setActivities(response.data.activities);
    } else {
      setError(response.error || 'Failed to load activities');
      setActivities([]);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCityPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleModeSwitch = (mode: 'cities' | 'activities') => {
    setSearchMode(mode);
    setSearchQuery('');
    setError(null);
    setCityPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCityPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // City helper functions
  const getCostLevel = (costIndex?: number): { label: string; color: string } => {
    if (!costIndex) return { label: 'Unknown', color: 'text-gray-500' };
    
    if (costIndex <= 30) return { label: 'Budget', color: 'text-green-600' };
    if (costIndex <= 60) return { label: 'Moderate', color: 'text-yellow-600' };
    if (costIndex <= 80) return { label: 'Expensive', color: 'text-orange-600' };
    return { label: 'Luxury', color: 'text-red-600' };
  };

  const formatPopularity = (popularity?: number): string => {
    if (!popularity) return 'New';
    if (popularity >= 90) return 'Very Popular';
    if (popularity >= 70) return 'Popular';
    if (popularity >= 50) return 'Well-known';
    return 'Hidden Gem';
  };

  // Activity helper functions
  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case ActivityCategory.SIGHTSEEING: return '🏛️';
      case ActivityCategory.FOOD: return '🍽️';
      case ActivityCategory.ADVENTURE: return '🎒';
      case ActivityCategory.SHOPPING: return '🛍️';
      case ActivityCategory.ENTERTAINMENT: return '🎭';
      case ActivityCategory.CULTURE: return '🎨';
      case ActivityCategory.NATURE: return '🌲';
      case ActivityCategory.SPORTS: return '⚽';
      case ActivityCategory.NIGHTLIFE: return '🌙';
      case ActivityCategory.RELAXATION: return '🧘';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: ActivityCategory): string => {
    switch (category) {
      case ActivityCategory.SIGHTSEEING: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ActivityCategory.FOOD: return 'bg-orange-100 text-orange-800 border-orange-200';
      case ActivityCategory.ADVENTURE: return 'bg-green-100 text-green-800 border-green-200';
      case ActivityCategory.SHOPPING: return 'bg-purple-100 text-purple-800 border-purple-200';
      case ActivityCategory.ENTERTAINMENT: return 'bg-pink-100 text-pink-800 border-pink-200';
      case ActivityCategory.CULTURE: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case ActivityCategory.NATURE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ActivityCategory.SPORTS: return 'bg-red-100 text-red-800 border-red-200';
      case ActivityCategory.NIGHTLIFE: return 'bg-gray-100 text-gray-800 border-gray-200';
      case ActivityCategory.RELAXATION: return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCost = (minCost?: number, maxCost?: number): string => {
    if (!minCost && !maxCost) return 'Free';
    if (minCost && maxCost) return `$${minCost} - $${maxCost}`;
    if (minCost) return `From $${minCost}`;
    if (maxCost) return `Up to $${maxCost}`;
    return 'Price varies';
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'Duration varies';
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Render functions
  const renderCityCard = (city: City, isPopular: boolean = false) => {
    const costLevel = getCostLevel(city.cost_index);
    
    return (
      <div 
        key={city.id}
        className={`
          bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden 
          hover:shadow-md transition-shadow cursor-pointer group
          ${isPopular ? 'ring-2 ring-blue-200' : ''}
        `}
      >
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {city.image_url ? (
            <img 
              src={city.image_url}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building className="w-12 h-12 text-white" />
            </div>
          )}
          
          {isPopular && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Popular
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                {city.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {city.country}
              </p>
            </div>
            
            {city.popularity && (
              <div className="flex items-center text-xs text-gray-500">
                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                {city.popularity}
              </div>
            )}
          </div>

          {city.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {city.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center ${costLevel.color}`}>
              <DollarSign className="w-3 h-3 mr-1" />
              {costLevel.label}
            </div>
            
            <div className="text-gray-500">
              {formatPopularity(city.popularity)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityCard = (activity: Activity) => {
    return (
      <div 
        key={activity.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {activity.image_url ? (
            <img 
              src={activity.image_url}
              alt={activity.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">{getCategoryIcon(activity.category)}</span>
            </div>
          )}
          
          <div className={`
            absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border
            ${getCategoryColor(activity.category)}
          `}>
            {getCategoryIcon(activity.category)} {activity.category}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
            {activity.name}
          </h3>

          {activity.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {activity.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatCost(activity.min_cost, activity.max_cost)}
              </div>
              
              {activity.duration && (
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(activity.duration)}
                </div>
              )}
            </div>

            {activity.city && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {activity.city.name}, {activity.city.country}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (searchMode !== 'cities' || cityPagination.totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, cityPagination.page - Math.floor(showPages / 2));
    const endPage = Math.min(cityPagination.totalPages, startPage + showPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(cityPagination.page - 1)}
          disabled={cityPagination.page === 1}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`
              px-3 py-2 border rounded-md text-sm font-medium
              ${page === cityPagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(cityPagination.page + 1)}
          disabled={cityPagination.page === cityPagination.totalPages}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (!locationService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Discover the World
          </h1>
          <p className="text-gray-600">Find amazing cities and activities for your next adventure</p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleModeSwitch('cities')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
                ${searchMode === 'cities' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <Building className="w-4 h-4" />
              <span>Cities</span>
            </button>
            
            <button
              onClick={() => handleModeSwitch('activities')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
                ${searchMode === 'activities' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <Tag className="w-4 h-4" />
              <span>Activities</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchMode === 'cities' ? "Search cities..." : "Search activities..."}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors
                ${showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              {searchMode === 'cities' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={citySortBy}
                      onChange={(e) => setCitySortBy(e.target.value as CitySearchParams['sortBy'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="country">Country</option>
                      <option value="popularity">Popularity</option>
                      <option value="cost_index">Cost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select
                      value={citySortOrder}
                      onChange={(e) => setCitySortOrder(e.target.value as CitySearchParams['sortOrder'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ASC">Ascending</option>
                      <option value="DESC">Descending</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Cities</option>
                      {allCities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as ActivityCategory | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {Object.values(ActivityCategory).map(category => (
                        <option key={category} value={category}>
                          {getCategoryIcon(category)} {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Cost ($)</label>
                    <input
                      type="number"
                      value={minCost}
                      onChange={(e) => setMinCost(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Cost ($)</label>
                    <input
                      type="number"
                      value={maxCost}
                      onChange={(e) => setMaxCost(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={activitySortBy}
                      onChange={(e) => setActivitySortBy(e.target.value as ActivitySearchParams['sortBy'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="category">Category</option>
                      <option value="min_cost">Min Cost</option>
                      <option value="max_cost">Max Cost</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select
                      value={activitySortOrder}
                      onChange={(e) => setActivitySortOrder(e.target.value as ActivitySearchParams['sortOrder'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ASC">Ascending</option>
                      <option value="DESC">Descending</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Cities Section (only for cities mode when no search) */}
        {searchMode === 'cities' && !searchQuery && !selectedCountry && popularCities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularCities.map(city => renderCityCard(city, true))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {searchQuery ? 'Search Results' : searchMode === 'cities' ? 'All Cities' : 'All Activities'}
            </h2>
            <span className="text-sm text-gray-500">
              {searchMode === 'cities' 
                ? `${cityPagination.total} cities found`
                : `${activities.length} activities found`
              }
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin w-8 h-8 text-blue-600 mr-3" />
            <span className="text-gray-600">Loading {searchMode}...</span>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {searchMode === 'cities' ? (
              cities.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {cities.map(city => renderCityCard(city))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or filters</p>
                </div>
              )
            ) : (
              activities.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {activities.map(activity => renderActivityCard(activity))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">
                    {searchQuery || selectedCityId || selectedCategory
                      ? "Try adjusting your search terms or filters"
                      : "Start searching to discover amazing activities"
                    }
                  </p>
                </div>
              )
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CombinedSearch;
