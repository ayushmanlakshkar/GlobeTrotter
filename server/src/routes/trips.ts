import { Router } from 'express';
import { TripController } from '../controllers/tripController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All trip routes require authentication
router.use(authenticateToken);

// Trip discovery routes
router.get('/regional-selections', TripController.getTopRegionalSelections);
router.get('/previous', TripController.getPreviousTrips);
router.get('/upcoming', TripController.getUpcomingTrips);
router.get('/:tripId', TripController.getTripById);

export default router;
