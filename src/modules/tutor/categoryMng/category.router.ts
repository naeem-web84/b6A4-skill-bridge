 
import { Router } from 'express';
import { categoryController } from './category.controller';
import auth, { UserRole } from '../../../middleware/auth.middleware';

const router: Router = Router();

 
router.post(
  '/',
  auth(UserRole.TUTOR),
  categoryController.addTeachingCategory
);
 
router.get(
  '/',
  auth(UserRole.TUTOR),
  categoryController.getTutorCategories
);
 
router.delete(
  '/:categoryId',
  auth(UserRole.TUTOR),
  categoryController.removeTeachingCategory
);

export const categoryRouter: Router = router;