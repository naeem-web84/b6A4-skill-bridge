 
import { Router } from 'express';
import { reviewController } from './review.controller';
import auth, { UserRole } from '../../../middleware/auth.middleware';

const router: Router = Router();
 
router.get(
  '/',
  auth(UserRole.TUTOR),
  reviewController.getTutorReviews
);

export const reviewRouter: Router = router;