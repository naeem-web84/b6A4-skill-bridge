import { Router } from 'express';
import { adminController } from './admin.controller';
import auth, { UserRole } from '../../middleware/auth.middleware';

const router: Router = Router();

router.get('/users', auth(UserRole.ADMIN), adminController.getAllUsers);
router.put('/users/:userId', auth(UserRole.ADMIN), adminController.updateUser);
router.delete('/users/:userId', auth(UserRole.ADMIN), adminController.deleteUser);

router.get('/tutors', auth(UserRole.ADMIN), adminController.getAllTutors);
router.put('/tutors/:tutorId', auth(UserRole.ADMIN), adminController.updateTutorProfile);
router.delete('/tutors/:tutorId', auth(UserRole.ADMIN), adminController.deleteTutor);

router.get('/categories', auth(UserRole.ADMIN), adminController.getAllCategories);
router.post('/categories', auth(UserRole.ADMIN), adminController.createCategory);
router.put('/categories/:categoryId', auth(UserRole.ADMIN), adminController.updateCategory);
router.delete('/categories/:categoryId', auth(UserRole.ADMIN), adminController.deleteCategory);

router.get('/bookings', auth(UserRole.ADMIN), adminController.getAllBookings);
router.put('/bookings/:bookingId', auth(UserRole.ADMIN), adminController.updateBooking);

router.get('/reviews', auth(UserRole.ADMIN), adminController.getAllReviews);
router.put('/reviews/:reviewId', auth(UserRole.ADMIN), adminController.updateReview);
router.delete('/reviews/:reviewId', auth(UserRole.ADMIN), adminController.deleteReview);

router.get('/stats', auth(UserRole.ADMIN), adminController.getPlatformStats);

router.post('/notifications', auth(UserRole.ADMIN), adminController.sendNotification);

export const adminRouter: Router = router;