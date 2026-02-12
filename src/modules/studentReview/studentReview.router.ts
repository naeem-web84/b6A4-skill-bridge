// modules/StudentReviews/studentReview.router.ts
import { Router } from 'express';
import { studentReviewController } from './studentReview.controller';
import auth, { UserRole } from '../../middleware/auth.middleware';

const router: Router = Router();

/* ========== STUDENT REVIEW ROUTES ========== */

// POST /api/student/reviews - Create a review
router.post(
  '/',
  auth(UserRole.STUDENT),
  studentReviewController.createReview
);

// GET /api/student/reviews - Get student's reviews
router.get(
  '/',
  auth(UserRole.STUDENT),
  studentReviewController.getStudentReviews
);

// PUT /api/student/reviews/:reviewId - Update a review
router.put(
  '/:reviewId',
  auth(UserRole.STUDENT),
  studentReviewController.updateReview
);

// DELETE /api/student/reviews/:reviewId - Delete a review
router.delete(
  '/:reviewId',
  auth(UserRole.STUDENT),
  studentReviewController.deleteReview
);

// GET /api/student/reviews/:reviewId - Get single review
router.get(
  '/:reviewId',
  auth(UserRole.STUDENT),
  studentReviewController.getReviewById
);

export const studentReviewRouter: Router = router;