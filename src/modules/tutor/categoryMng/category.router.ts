// modules/tutor/categoryMng/category.router.ts
import { Router } from 'express';
import { categoryController } from './category.controller';
import auth, { UserRole } from '../../../middleware/auth.middleware';

const router: Router = Router();

/* ========== CATEGORY MANAGEMENT ROUTES ========== */

// POST /api/tutors/categories - Add teaching category
router.post(
  '/',
  auth(UserRole.TUTOR),
  categoryController.addTeachingCategory
);

// GET /api/tutors/categories - Get tutor's categories
router.get(
  '/',
  auth(UserRole.TUTOR),
  categoryController.getTutorCategories
);

// DELETE /api/tutors/categories/:categoryId - Remove category
router.delete(
  '/:categoryId',
  auth(UserRole.TUTOR),
  categoryController.removeTeachingCategory
);

export const categoryRouter: Router = router;