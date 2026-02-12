import { Router } from 'express';  
import { studentController } from './student.controller';
import auth, { UserRole } from '../../middleware/auth.middleware';

const router: Router = Router();
 
router.post(
  '/profile', 
  auth(UserRole.STUDENT), 
  studentController.createStudentProfile
);

router.get(
  '/profile', 
  auth(UserRole.STUDENT), 
  studentController.getStudentProfile
);

router.put(
  '/profile', 
  auth(UserRole.STUDENT), 
  studentController.updateStudentProfile
);
 
router.post(
  '/bookings',
  auth(UserRole.STUDENT),
  studentController.createBooking
);

router.get(
  '/bookings',
  auth(UserRole.STUDENT),
  studentController.getStudentBookings
);

 
router.delete(
  '/bookings/:bookingId',
  auth(UserRole.STUDENT),
  studentController.cancelBooking
);

export const studentRouter: Router = router;