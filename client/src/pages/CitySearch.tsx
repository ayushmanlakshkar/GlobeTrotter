import React, { useState, useEffect } from 'react';
import { 
  LocationService, 
  City, 
  CitySearchParams,
  PaginationInfo
} from '../services/location.service';
import { authHeader } from '../utils/auth-header';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Loader
} from 'lucide-react';

interface CitySearchProps {}

const CitySearch: React.FC<CitySearchProps> = () => {
  // State for location service
  const [locationService, setLocationService] = useState<LocationService | null>(null);
  
  // State for cities data
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortBy, setSortBy] = useState<CitySearchParams['sortBy']>('name');
  const [sortOrder, setSortOrder] = useState<CitySearchParams['sortOrder']>('ASC');
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
      loadCities();
    }
  }, [locationService]);

  // Load cities when search parameters change
  useEffect(() => {
    if (locationService) {
      loadCities();
    }
  }, [locationService, searchQuery, selectedCountry, sortBy, sortOrder, pagination.page]);

  const loadCountries = async () => {
    if (!locationService) return;
    
    try {
      console.log('Loading countries...');
      const response = await locationService.getCountries();
      console.log('Countries response:', response);
      if (response.success) {
        setCountries(response.data.countries);
        console.log('Countries loaded successfully:', response.data.countries.length);
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

  const loadCities = async () => {
    if (!locationService) return;

    setLoading(true);
    setError(null);

    try {
      const params: CitySearchParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCountry) {
        params.country = selectedCountry;
      }

      console.log('Loading cities with params:', params);
      const response = await locationService.getCities(params);
      console.log('Cities response:', response);
      
      if (response.success) {
        setCities(response.data.cities);
        setPagination(response.data.pagination);
        console.log('Cities loaded successfully:', response.data.cities.length);
      } else {
        console.error('Failed to load cities:', response.error);
        setError(response.error || 'Failed to load cities');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry(country);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: CitySearchParams['sortBy']) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {city.image_url ? (
            <img 
              src={city.image_url}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-white" />
            </div>
          )}
          
          {isPopular && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Popular
            </div>
          )}
        </div>

        {/* Content */}
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

  const renderCityListItem = (city: City) => {
    const costLevel = getCostLevel(city.cost_index);
    
    return (
      <div 
        key={city.id}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
            {city.image_url ? (
              <img 
                src={city.image_url}
                alt={city.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg text-gray-800 truncate">
                {city.name}
              </h3>
              
              {city.popularity && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                  {city.popularity}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 flex items-center mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {city.country}
            </p>

            {city.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
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
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(showPages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + showPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
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
              ${page === pagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
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
            Discover Cities
          </h1>
          <p className="text-gray-600">Find your next travel destination</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities..."
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
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as CitySearchParams['sortBy'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="country">Country</option>
                  <option value="popularity">Popularity</option>
                  <option value="cost_index">Cost</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as CitySearchParams['sortOrder'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Popular Cities Section */}
        {!searchQuery && !selectedCountry && popularCities.length > 0 && (
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
              {searchQuery || selectedCountry ? 'Search Results' : 'All Cities'}
            </h2>
            <span className="text-sm text-gray-500">
              {pagination.total} cities found
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
            <span className="text-gray-600">Loading cities...</span>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {cities.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {cities.map(city => 
                  viewMode === 'grid' 
                    ? renderCityCard(city)
                    : renderCityListItem(city)
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CitySearch;
