import { Router } from 'express';
import { LocationController } from '../controllers/locationController';

const router = Router();

// Countries
router.get('/countries', LocationController.getCountries);

// Cities
router.get('/cities', LocationController.getCities);
router.get('/cities/popular', LocationController.getPopularCities);
router.get('/cities/:cityId', LocationController.getCityById);
router.get('/cities/:cityId/activities', LocationController.getCityActivities);

// Activities
router.get('/activities', LocationController.getActivities);
router.get('/activities/search', LocationController.searchActivities);

// Cities by country
router.get('/countries/:country/cities', LocationController.getCitiesByCountry);

// Search
router.get('/search', LocationController.searchLocations);

export default router;
