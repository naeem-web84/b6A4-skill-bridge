 
import { Router } from 'express';
import { studentCategoryController } from './studentCategory.controller';

const router: Router = Router();
  
router.get(
  '/',
  studentCategoryController.getAllCategories
);
 
router.get(
  '/:categoryId',
  studentCategoryController.getCategoryById
);
 
router.get(
  '/:categoryId/tutors',
  studentCategoryController.getTutorsByCategory
);

export const studentCategoryRouter: Router = router;