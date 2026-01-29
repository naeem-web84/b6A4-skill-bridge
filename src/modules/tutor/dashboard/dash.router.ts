// modules/tutor/dashboard/dashboard.router.ts
import { Router } from 'express'; 
import auth, { UserRole } from '../../../middleware/auth.middleware';
import { dashboardController } from './dash.controller';

const router: Router = Router();

/* ========== DASHBOARD ROUTES ========== */

// GET /api/tutors/dashboard/stats - Get tutor dashboard statistics
router.get(
  '/stats',
  auth(UserRole.TUTOR),
  dashboardController.getDashboardStats
);

// GET /api/tutors/dashboard/upcoming - Get upcoming sessions
router.get(
  '/upcoming',
  auth(UserRole.TUTOR),
  dashboardController.getUpcomingSessions
);

export const dashboardRouter: Router = router;