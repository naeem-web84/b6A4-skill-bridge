import { Router } from 'express'; 
import auth, { UserRole } from '../../../middleware/auth.middleware';
import { tutorController } from './tutor.controller';

const router: Router = Router(); 
router.post('/create-profile', auth(UserRole.STUDENT), tutorController.createTutorProfile);

 
router.get('/profile', auth(UserRole.TUTOR), tutorController.getTutorProfile);

 
router.get('/check-eligibility', auth(UserRole.STUDENT), tutorController.checkEligibility);
 
router.get('/categories', auth(), tutorController.getAvailableCategories);

router.put('/profile', auth(UserRole.TUTOR), tutorController.updateTutorProfile);


export const tutorRouter: Router = router;