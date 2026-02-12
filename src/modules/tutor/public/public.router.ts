 
import { Router } from 'express';
import { publicTutorController } from './public.controller'; 

const router: Router = Router();

router.get(
  '/', 
  publicTutorController.browseTutors
);

router.get(
  '/:tutorId',
  publicTutorController.getTutorProfile
);

 
router.get(
  '/:tutorId/availability',
  publicTutorController.getTutorAvailability
);

export const publicTutorRouter: Router = router;