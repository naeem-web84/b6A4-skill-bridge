// routes/tutor.routes.ts
import { Router } from 'express'; 
import auth, { UserRole } from '../../middleware/auth.middleware';
import { tutorController } from './tutor.controller';

const router: Router = Router();
// Create tutor profile (student to tutor conversion)
router.post('/create-profile', auth(UserRole.STUDENT), tutorController.createTutorProfile);



export const tutorRouter: Router = router;