import { Request, Response } from 'express';
import { City } from '../models/City';
import { Op } from 'sequelize';

export class LocationController {
  /**
   * Get all countries
   */
  static async getCountries(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      
      let whereClause = {};
      if (search) {
        whereClause = {
          country: {
            [Op.iLike]: `%${search}%`
          }
        };
      }

      const countries = await City.findAll({
        where: whereClause,
        attributes: ['country'],
        group: ['country'],
        order: [['country', 'ASC']],
        raw: true
      });

      const countryList = countries.map(item => item.country);

      res.status(200).json({
        success: true,
        data: {
          countries: countryList,
          total: countryList.length
        }
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch countries',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all cities
   */
  static async getCities(req: Request, res: Response): Promise<void> {
    try {
      const { 
        country, 
        search, 
        limit = 50, 
        page = 1,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      let whereClause: any = {};
      
      // Filter by country if provided
      if (country) {
        whereClause.country = country;
      }
      
      // Search in city name or country if search term provided
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { country: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Validate sort parameters
      const validSortFields = ['name', 'country', 'popularity', 'cost_index', 'created_at'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const finalSortBy = validSortFields.includes(sortBy as string) ? sortBy as string : 'name';
      const finalSortOrder = validSortOrders.includes((sortOrder as string).toUpperCase()) 
        ? (sortOrder as string).toUpperCase() 
        : 'ASC';

      const cities = await City.findAndCountAll({
        where: whereClause,
        order: [[finalSortBy, finalSortOrder]],
        limit: Number(limit),
        offset: offset,
        attributes: ['id', 'name', 'country', 'cost_index', 'popularity', 'description', 'image_url']
      });

      res.status(200).json({
        success: true,
        data: {
          cities: cities.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: cities.count,
            totalPages: Math.ceil(cities.count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cities by country
   */
  static async getCitiesByCountry(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;
      const { 
        search, 
        limit = 50, 
        page = 1,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      let whereClause: any = { country };
      
      // Search in city name if search term provided
      if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` };
      }

      // Validate sort parameters
      const validSortFields = ['name', 'popularity', 'cost_index', 'created_at'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const finalSortBy = validSortFields.includes(sortBy as string) ? sortBy as string : 'name';
      const finalSortOrder = validSortOrders.includes((sortOrder as string).toUpperCase()) 
        ? (sortOrder as string).toUpperCase() 
        : 'ASC';

      const cities = await City.findAndCountAll({
        where: whereClause,
        order: [[finalSortBy, finalSortOrder]],
        limit: Number(limit),
        offset: offset,
        attributes: ['id', 'name', 'country', 'cost_index', 'popularity', 'description', 'image_url']
      });

      if (cities.count === 0) {
        res.status(404).json({
          error: 'No cities found for this country'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          country,
          cities: cities.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: cities.count,
            totalPages: Math.ceil(cities.count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching cities by country:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cities by country',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get popular cities
   */
  static async getPopularCities(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20, country } = req.query;
      
      let whereClause: any = {
        popularity: {
          [Op.ne]: null
        }
      };
      
      if (country) {
        whereClause.country = country;
      }

      const cities = await City.findAll({
        where: whereClause,
        order: [['popularity', 'DESC']],
        limit: Number(limit),
        attributes: ['id', 'name', 'country', 'cost_index', 'popularity', 'description', 'image_url']
      });

      res.status(200).json({
        success: true,
        data: {
          cities,
          total: cities.length
        }
      });
    } catch (error) {
      console.error('Error fetching popular cities:', error);
      res.status(500).json({ 
        error: 'Failed to fetch popular cities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search cities and countries
   */
  static async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm, limit = 20 } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          error: 'Search term is required'
        });
        return;
      }

      const cities = await City.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { country: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        order: [['popularity', 'DESC']],
        limit: Number(limit),
        attributes: ['id', 'name', 'country', 'cost_index', 'popularity', 'description', 'image_url']
      });

      // Group results by type
      const results = {
        cities: cities.map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
          cost_index: city.cost_index,
          popularity: city.popularity,
          description: city.description,
          image_url: city.image_url,
          type: 'city'
        })),
        countries: [...new Set(cities.map(city => city.country))].map(country => ({
          name: country,
          type: 'country'
        }))
      };

      res.status(200).json({
        success: true,
        data: {
          query: searchTerm,
          results,
          total: results.cities.length + results.countries.length
        }
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(500).json({ 
        error: 'Failed to search locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get city by ID
   */
  static async getCityById(req: Request, res: Response): Promise<void> {
    try {
      const { cityId } = req.params;

      const city = await City.findByPk(cityId);

      if (!city) {
        res.status(404).json({
          error: 'City not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: city
      });
    } catch (error) {
      console.error('Error fetching city by ID:', error);
      res.status(500).json({ 
        error: 'Failed to fetch city',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
