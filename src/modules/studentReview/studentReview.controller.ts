// modules/StudentReviews/studentReview.controller.ts
import { Request, Response } from 'express';
import { studentReviewService } from './studentReview.service';

/* ========== CREATE REVIEW ========== */
const createReview = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await studentReviewService.createReview(studentUserId, {
      bookingId,
      rating,
      comment
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Create review controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== GET STUDENT'S REVIEWS ========== */
const getStudentReviews = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      page = '1',
      limit = '10',
      sortBy = 'newest',
      tutorId
    } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string
    };

    if (tutorId) filters.tutorId = tutorId as string;

    const result = await studentReviewService.getStudentReviews(studentUserId, filters);
    
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('Get student reviews controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== UPDATE REVIEW ========== */
const updateReview = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await studentReviewService.updateReview(
      studentUserId,
      reviewId,
      { rating, comment }
    );

    return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
  } catch (error: any) {
    console.error('Update review controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== DELETE REVIEW ========== */
const deleteReview = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const result = await studentReviewService.deleteReview(studentUserId, reviewId);

    return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
  } catch (error: any) {
    console.error('Delete review controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== GET SINGLE REVIEW ========== */
const getReviewById = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const result = await studentReviewService.getReviewById(studentUserId, reviewId);

    return res.status(result.success ? 200 : (result.statusCode || 404)).json(result);
  } catch (error: any) {
    console.error('Get review by ID controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== EXPORT ========== */
export const studentReviewController = {
  createReview,
  getStudentReviews,
  updateReview,
  deleteReview,
  getReviewById
};