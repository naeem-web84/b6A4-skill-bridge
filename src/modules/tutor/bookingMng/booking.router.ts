 
import { Router } from 'express';
import auth, { UserRole } from '../../../middleware/auth.middleware';
import { bookingController } from './booking.controller';

const router: Router = Router();
 
router.get(
  '/',
  auth(UserRole.TUTOR),
  bookingController.getTutorBookings
);
 
router.get(
  '/stats',
  auth(UserRole.TUTOR),
  bookingController.getBookingStats
);
 
router.get(
  '/:bookingId',
  auth(UserRole.TUTOR),
  bookingController.getBookingById
);
 
router.put(
  '/:bookingId/status',
  auth(UserRole.TUTOR),
  bookingController.updateBookingStatus
);
 
export const bookingRouter: Router = router;
 