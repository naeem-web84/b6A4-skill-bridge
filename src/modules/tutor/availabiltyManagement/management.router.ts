 
import { Router } from 'express';
import auth, { UserRole } from '../../../middleware/auth.middleware'; 
import { availabilityController } from './management.controller';

const router: Router = Router();

router.post(
  '/',
  auth(UserRole.TUTOR),
  availabilityController.createAvailabilitySlot
);

router.get(
  '/',
  auth(UserRole.TUTOR),
  availabilityController.getTutorAvailability
);

router.get(
  '/:Id',
  auth(UserRole.TUTOR),
  availabilityController.getAvailabilitySlot
);

router.put(
  '/:slotId',
  auth(UserRole.TUTOR),
  availabilityController.updateAvailabilitySlot
);

router.delete(
  '/:slotId',
  auth(UserRole.TUTOR),
  availabilityController.deleteAvailabilitySlot
);

export const availabilityRouter: Router = router;