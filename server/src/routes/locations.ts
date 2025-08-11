import { Router } from 'express';
import { LocationController } from '../controllers/locationController';

const router = Router();

// ===== COUNTRY ROUTES =====
router.get('/countries', LocationController.getCountries);
router.get('/countries/:country/cities', LocationController.getCitiesByCountry);

// ===== CITY ROUTES =====
router.get('/cities', LocationController.getCities);
router.get('/cities/popular', LocationController.getPopularCities);
router.get('/cities/:cityId', LocationController.getCityById);
router.get('/cities/:cityId/activities', LocationController.getCityActivities);

// ===== ACTIVITY ROUTES =====
router.get('/activities', LocationController.getActivities);
router.get('/activities/search', LocationController.searchActivities);

// ===== SEARCH ROUTES =====
router.get('/search', LocationController.searchLocations);

export default router;
