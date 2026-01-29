// modules/student/student.router.ts
import { Router } from 'express';  
import { studentController } from './student.controller';
import auth, { UserRole } from '../../middleware/auth.middleware';

const router: Router = Router();

// ========== STUDENT PROFILE ROUTES ==========

// ✅ ADDED: Create student profile (auto-called after signup or manually)
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

// ========== BOOKING ROUTES ==========

// Create booking
router.post(
  '/bookings',
  auth(UserRole.STUDENT),
  studentController.createBooking
);

// Get student's bookings
router.get(
  '/bookings',
  auth(UserRole.STUDENT),
  studentController.getStudentBookings
);

// Cancel booking
router.delete(
  '/bookings/:bookingId',
  auth(UserRole.STUDENT),
  studentController.cancelBooking
);

export const studentRouter: Router = router;