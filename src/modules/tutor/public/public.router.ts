// modules/tutor/public/public.router.ts
import { Router } from 'express';
import { publicTutorController } from './public.controller';
import auth, { UserRole } from '../../../middleware/auth.middleware';

const router: Router = Router();

/* ========== PUBLIC TUTOR ROUTES (FOR STUDENTS) ========== */

// GET /api/tutors/public - Browse/search tutors
router.get(
  '/',
  auth(UserRole.STUDENT),
  publicTutorController.browseTutors
);

// GET /api/tutors/public/:tutorId - View specific tutor profile
router.get(
  '/:tutorId',
  auth(UserRole.STUDENT),
  publicTutorController.getTutorProfile
);

// GET /api/tutors/public/:tutorId/availability - Check tutor availability
router.get(
  '/:tutorId/availability',
  auth(UserRole.STUDENT),
  publicTutorController.getTutorAvailability
);

export const publicTutorRouter: Router = router;