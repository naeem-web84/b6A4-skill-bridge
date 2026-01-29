// modules/tutor/bookingMng/booking.router.ts
import { Router } from 'express';
import auth, { UserRole } from '../../../middleware/auth.middleware';
import { bookingController } from './booking.controller';

const router: Router = Router();

// Get tutor's bookings
router.get(
  '/',
  auth(UserRole.TUTOR),
  bookingController.getTutorBookings
);

// Get booking statistics
router.get(
  '/stats',
  auth(UserRole.TUTOR),
  bookingController.getBookingStats
);

// Get single booking details
router.get(
  '/:bookingId',
  auth(UserRole.TUTOR),
  bookingController.getBookingById
);

// Update booking status
router.put(
  '/:bookingId/status',
  auth(UserRole.TUTOR),
  bookingController.updateBookingStatus
);

/* Export as named export */
export const bookingRouter: Router = router;

/* OR export as default (choose one) */
// export default router;