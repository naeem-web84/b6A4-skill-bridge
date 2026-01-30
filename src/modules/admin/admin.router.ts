// modules/admin/admin.router.ts
import { Router } from 'express';
import { adminController } from './admin.controller'; 
import auth, { UserRole } from '../../middleware/auth.middleware'; 

const router: Router = Router();

/* ========== USER MANAGEMENT ========== */

// GET /api/admin/users - Get all users with pagination and filters
router.get(
  '/users',
  auth(UserRole.ADMIN),
  adminController.getAllUsers
);

// PUT /api/admin/users/:userId - Update user role/status
router.put(
  '/users/:userId',
  auth(UserRole.ADMIN),
  adminController.updateUser
);

// DELETE /api/admin/users/:userId - Delete user
router.delete(
  '/users/:userId',
  auth(UserRole.ADMIN),
  adminController.deleteUser
);

/* ========== TUTOR MANAGEMENT ========== */

// GET /api/admin/tutors - Get all tutors with pagination and filters
router.get(
  '/tutors',
  auth(UserRole.ADMIN),
  adminController.getAllTutors
);

// PUT /api/admin/tutors/:tutorId - Update tutor profile
router.put(
  '/tutors/:tutorId',
  auth(UserRole.ADMIN),
  adminController.updateTutorProfile
);

// DELETE /api/admin/tutors/:tutorId - Delete tutor
router.delete(
  '/tutors/:tutorId',
  auth(UserRole.ADMIN),
  adminController.deleteTutor
);

/* ========== CATEGORY MANAGEMENT ========== */

// GET /api/admin/categories - Get all categories
router.get(
  '/categories',
  auth(UserRole.ADMIN),
  adminController.getAllCategories
);

// POST /api/admin/categories - Create new category
router.post(
  '/categories',
  auth(UserRole.ADMIN),
  adminController.createCategory
);

// PUT /api/admin/categories/:categoryId - Update category
router.put(
  '/categories/:categoryId',
  auth(UserRole.ADMIN),
  adminController.updateCategory
);

// DELETE /api/admin/categories/:categoryId - Delete category
router.delete(
  '/categories/:categoryId',
  auth(UserRole.ADMIN),
  adminController.deleteCategory
);

/* ========== BOOKING MANAGEMENT ========== */

// GET /api/admin/bookings - Get all bookings
router.get(
  '/bookings',
  auth(UserRole.ADMIN),
  adminController.getAllBookings
);

// PUT /api/admin/bookings/:bookingId - Update booking
router.put(
  '/bookings/:bookingId',
  auth(UserRole.ADMIN),
  adminController.updateBooking
);

/* ========== REVIEW MANAGEMENT ========== */

// GET /api/admin/reviews - Get all reviews
router.get(
  '/reviews',
  auth(UserRole.ADMIN),
  adminController.getAllReviews
);

// PUT /api/admin/reviews/:reviewId - Update review
router.put(
  '/reviews/:reviewId',
  auth(UserRole.ADMIN),
  adminController.updateReview
);

// DELETE /api/admin/reviews/:reviewId - Delete review
router.delete(
  '/reviews/:reviewId',
  auth(UserRole.ADMIN),
  adminController.deleteReview
);

/* ========== PLATFORM STATISTICS ========== */

// GET /api/admin/stats - Get platform statistics
router.get(
  '/stats',
  auth(UserRole.ADMIN),
  adminController.getPlatformStats
);

/* ========== NOTIFICATION MANAGEMENT ========== */

// POST /api/admin/notifications - Send notification
router.post(
  '/notifications',
  auth(UserRole.ADMIN),
  adminController.sendNotification
);

export const adminRouter: Router = router;