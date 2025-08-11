import { Router } from 'express';
import { TripController } from '../controllers/tripController';
import { authenticateToken } from '../middleware/auth';
import { validateCreateTrip, validateAddTripStop, validateAddTripActivity, validateSuggestedActivities } from '../middleware/validation';

const router = Router();

// All trip routes require authentication
router.use(authenticateToken);

// Trip discovery routes (must be before :tripId routes to avoid conflicts)
router.get('/regional-selections', TripController.getTopRegionalSelections);
router.get('/previous', TripController.getPreviousTrips);
router.get('/upcoming', TripController.getUpcomingTrips);

// Trip CRUD operations
router.post('/', validateCreateTrip, TripController.createTrip);
router.get('/:tripId', TripController.getTripById);

// Trip stop management
router.post('/:tripId/stops', validateAddTripStop, TripController.addTripStop);
router.delete('/:tripId/stops/:stopId', TripController.removeTripStop);

// Trip activity management
router.post('/:tripId/stops/:stopId/activities', validateAddTripActivity, TripController.addTripActivity);
router.delete('/:tripId/stops/:stopId/activities/:activityId', TripController.removeTripActivity);

// Suggestion endpoints
router.get('/:tripId/suggested-places', TripController.getSuggestedPlaces);
router.get('/:tripId/suggested-activities', validateSuggestedActivities, TripController.getSuggestedActivities);

export default router;
