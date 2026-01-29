// modules/tutor/reviews/review.router.ts
import { Router } from 'express';
import { reviewController } from './review.controller';
import auth, { UserRole } from '../../../middleware/auth.middleware';

const router: Router = Router();

/* ========== REVIEWS ROUTES ========== */

// GET /api/tutors/reviews - Get tutor's reviews
router.get(
  '/',
  auth(UserRole.TUTOR),
  reviewController.getTutorReviews
);

export const reviewRouter: Router = router;