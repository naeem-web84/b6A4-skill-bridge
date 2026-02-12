 
import { Router } from 'express';
import auth, { UserRole } from '../../../middleware/auth.middleware';
import { getBookingController } from './getBooking.controller';

const router: Router = Router();
 
router.get(
  '/',
  auth(UserRole.TUTOR),
  getBookingController.getAllTutorBookings
);
 
router.get(
  '/stats',
  auth(UserRole.TUTOR),
  getBookingController.getTutorBookingStats
);
 
router.get(
  '/pending-count',
  auth(UserRole.TUTOR),
  getBookingController.getPendingBookingsCount
);
 
export const getBookingRouter: Router = router;