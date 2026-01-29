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

 // Get tutor's availability slots
router.get(
  '/',
  auth(UserRole.TUTOR),
  availabilityController.getTutorAvailability
);

// Get single availability slot
router.get(
  '/:Id',
  auth(UserRole.TUTOR),
  availabilityController.getAvailabilitySlot
);

// Update availability slot
router.put(
  '/:slotId',
  auth(UserRole.TUTOR),
  availabilityController.updateAvailabilitySlot
);

// Delete availability slot
router.delete(
  '/:slotId',
  auth(UserRole.TUTOR),
  availabilityController.deleteAvailabilitySlot
);


 
export const availabilityRouter: Router = router; 