export interface City {
  id: string;
  name: string;
  country: string;
  cost_index?: number;
  popularity?: number;
  description?: string;
  image_url?: string;
}

export interface Activity {
  id: string;
  city_id: string;
  name: string;
  description?: string;
  min_cost?: number;
  max_cost?: number;
  duration?: number;
  category: ActivityCategory;
  image_url?: string;
  city?: {
    id: string;
    name: string;
    country: string;
  };
}

export enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  FOOD = 'food',
  ADVENTURE = 'adventure',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  CULTURE = 'culture',
  NATURE = 'nature',
  SPORTS = 'sports',
  NIGHTLIFE = 'nightlife',
  RELAXATION = 'relaxation'
}

export interface SearchResult {
  cities: (City & { type: 'city' })[];
  countries: { name: string; type: 'country' }[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CitySearchParams {
  country?: string;
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: 'name' | 'country' | 'popularity' | 'cost_index' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ActivitySearchParams {
  search?: string;
  cityId?: string;
  category?: ActivityCategory;
  min_cost?: number;
  max_cost?: number;
  limit?: number;
  page?: number;
  sortBy?: 'name' | 'category' | 'min_cost' | 'max_cost' | 'duration' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string;
}

export class LocationService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  // Countries
  async getCountries(search?: string): Promise<ApiResponse<{ countries: string[]; total: number }>> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`${this.baseUrl}/locations/countries?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching countries:', error);
      return {
        success: false,
        data: { countries: [], total: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cities
  async getCities(params: CitySearchParams = {}): Promise<ApiResponse<{ cities: City[]; pagination: PaginationInfo }>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/locations/cities?${searchParams}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cities:', error);
      return {
        success: false,
        data: { cities: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getPopularCities(limit: number = 10, country?: string): Promise<ApiResponse<{ cities: City[]; total: number }>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (country) params.append('country', country);

      const response = await fetch(`${this.baseUrl}/locations/cities/popular?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching popular cities:', error);
      return {
        success: false,
        data: { cities: [], total: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCitiesByCountry(
    country: string,
    params: Omit<CitySearchParams, 'country'> = {}
  ): Promise<ApiResponse<{ cities: City[]; pagination: PaginationInfo }>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/locations/countries/${encodeURIComponent(country)}/cities?${searchParams}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cities by country:', error);
      return {
        success: false,
        data: { cities: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCityById(cityId: string): Promise<ApiResponse<City>> {
    try {
      const response = await fetch(`${this.baseUrl}/locations/cities/${cityId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching city by ID:', error);
      return {
        success: false,
        data: {} as City,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Activities
  async getActivities(params: ActivitySearchParams = {}): Promise<ApiResponse<{ 
    activities: Activity[]; 
    pagination: PaginationInfo;
    filters: any;
  }>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/locations/activities?${searchParams}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      return {
        success: false,
        data: { 
          activities: [], 
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          filters: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async searchActivities(query: string, params: { category?: ActivityCategory; limit?: number } = {}): Promise<ApiResponse<{ 
    query: string; 
    activities: Activity[]; 
    total: number 
  }>> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/locations/activities/search?${searchParams}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching activities:', error);
      return {
        success: false,
        data: { 
          query: '', 
          activities: [], 
          total: 0 
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCityActivities(
    cityId: string,
    params: Omit<ActivitySearchParams, 'cityId'> = {}
  ): Promise<ApiResponse<{ 
    city: { id: string; name: string; country: string }; 
    activities: Activity[]; 
    filters: any; 
    total: number 
  }>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/locations/cities/${cityId}/activities?${searchParams}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching city activities:', error);
      return {
        success: false,
        data: { 
          city: { id: '', name: '', country: '' }, 
          activities: [], 
          filters: {}, 
          total: 0 
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Search
  async searchLocations(query: string, limit: number = 20): Promise<ApiResponse<{ 
    query: string; 
    results: SearchResult; 
    total: number 
  }>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/locations/search?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching locations:', error);
      return {
        success: false,
        data: { 
          query: '', 
          results: { cities: [], countries: [] }, 
          total: 0 
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
