import { Router } from 'express';
import auth, { UserRole } from '../../../middleware/auth.middleware'; 
import { availabilityController } from './management.controller';

const router: Router = Router();

// Create availability slot
router.post(
  '/',
  auth(UserRole.TUTOR),
  availabilityController.createAvailabilitySlot
);


 
export const availabilityRouter: Router = router; 