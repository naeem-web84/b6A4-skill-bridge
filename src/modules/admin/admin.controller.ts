
import { Request, Response } from 'express';
import { adminService } from './admin.service';
import {
  UserFilters,
  TutorFilters,
  BookingFilters,
  CategoryFilters,
  ReviewFilters,
  UpdateUserData,
  UpdateTutorData,
  UpdateCategoryData,
  UpdateBookingData,
  UpdateReviewData,
  CreateCategoryData,
  CreateNotificationData,
  ServiceResponse
} from './admin.types';

/* ========== HELPER FUNCTIONS ========== */
const parseQueryParams = (req: Request, type: string): any => {
  const { query } = req;
  const result: any = {};

  // Common pagination params
  if (query.page) result.page = parseInt(query.page as string);
  if (query.limit) result.limit = parseInt(query.limit as string);
  if (query.search) result.search = query.search as string;
  if (query.sortBy) result.sortBy = query.sortBy as string;
  if (query.sortOrder) result.sortOrder = query.sortOrder as string;

  // Type-specific params
  switch (type) {
    case 'users':
      if (query.role) result.role = query.role as string;
      if (query.status) result.status = query.status as string;
      break;
    
    case 'tutors':
      if (query.minRating) result.minRating = parseFloat(query.minRating as string);
      if (query.maxHourlyRate) result.maxHourlyRate = parseFloat(query.maxHourlyRate as string);
      if (query.experienceYears) result.experienceYears = parseInt(query.experienceYears as string);
      break;
    
    case 'bookings':
      if (query.status) result.status = query.status as string;
      if (query.startDate) result.startDate = new Date(query.startDate as string);
      if (query.endDate) result.endDate = new Date(query.endDate as string);
      break;
    
    case 'categories':
      // No additional params needed
      break;
    
    case 'reviews':
      if (query.minRating) result.minRating = parseInt(query.minRating as string);
      if (query.maxRating) result.maxRating = parseInt(query.maxRating as string);
      if (query.isVerified) result.isVerified = query.isVerified === 'true';
      break;
  }

  return result;
};

const handleServiceResponse = (res: Response, result: ServiceResponse) => {
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  const response: any = {
    success: true,
    message: result.message,
    data: result.data
  };
  
  if (result.pagination) {
    response.pagination = result.pagination;
  }
  
  return res.status(200).json(response);
};

// Helper to safely extract string parameter
const getParamAsString = (param: string | string[] | undefined): string | null => {
  if (!param) return null;
  
  if (Array.isArray(param)) {
    // Take the first element if it's an array
    return param[0] || null;
  }
  
  return param;
};

/* ========== USER MANAGEMENT ========== */
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filters: UserFilters = parseQueryParams(req, 'users');
    const result = await adminService.getAllUsers(filters);
    
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get all users controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const targetUserId = getParamAsString(req.params.userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const updateData: UpdateUserData = {
      name: req.body.name,
      role: req.body.role,
      status: req.body.status,
      emailVerified: req.body.emailVerified
    };

    const result = await adminService.updateUser(targetUserId, updateData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Update user controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const targetUserId = getParamAsString(req.params.userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await adminService.deleteUser(targetUserId);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Delete user controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== TUTOR MANAGEMENT ========== */
const getAllTutors = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filters: TutorFilters = parseQueryParams(req, 'tutors');
    const result = await adminService.getAllTutors(filters);
    
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get all tutors controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tutorId = getParamAsString(req.params.tutorId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID is required'
      });
    }

    const updateData: UpdateTutorData = {
      headline: req.body.headline,
      bio: req.body.bio,
      hourlyRate: req.body.hourlyRate,
      experienceYears: req.body.experienceYears,
      education: req.body.education,
      certifications: req.body.certifications,
      rating: req.body.rating,
      totalReviews: req.body.totalReviews,
      completedSessions: req.body.completedSessions
    };

    const result = await adminService.updateTutorProfile(tutorId, updateData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Update tutor profile controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteTutor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tutorId = getParamAsString(req.params.tutorId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID is required'
      });
    }

    const result = await adminService.deleteTutor(tutorId);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Delete tutor controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== CATEGORY MANAGEMENT ========== */
const getAllCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filters: CategoryFilters = parseQueryParams(req, 'categories');
    const result = await adminService.getAllCategories(filters);
    
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get all categories controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const categoryData: CreateCategoryData = {
      name: req.body.name,
      description: req.body.description
    };

    if (!categoryData.name || categoryData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const result = await adminService.createCategory(categoryData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Create category controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const categoryId = getParamAsString(req.params.categoryId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const updateData: UpdateCategoryData = {
      name: req.body.name,
      description: req.body.description
    };

    const result = await adminService.updateCategory(categoryId, updateData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Update category controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const categoryId = getParamAsString(req.params.categoryId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const result = await adminService.deleteCategory(categoryId);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Delete category controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== BOOKING MANAGEMENT ========== */
const getAllBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filters: BookingFilters = parseQueryParams(req, 'bookings');
    const result = await adminService.getAllBookings(filters);
    
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get all bookings controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookingId = getParamAsString(req.params.bookingId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const updateData: UpdateBookingData = {
      status: req.body.status,
      amount: req.body.amount,
      isPaid: req.body.isPaid,
      meetingLink: req.body.meetingLink,
      notes: req.body.notes
    };

    const result = await adminService.updateBooking(bookingId, updateData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Update booking controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== REVIEW MANAGEMENT ========== */
const getAllReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filters: ReviewFilters = parseQueryParams(req, 'reviews');
    const result = await adminService.getAllReviews(filters);
    
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get all reviews controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const reviewId = getParamAsString(req.params.reviewId);
    
    if (!userId) {
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

    const updateData: UpdateReviewData = {
      rating: req.body.rating,
      comment: req.body.comment,
      isVerified: req.body.isVerified
    };

    const result = await adminService.updateReview(reviewId, updateData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Update review controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const reviewId = getParamAsString(req.params.reviewId);
    
    if (!userId) {
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

    const result = await adminService.deleteReview(reviewId);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Delete review controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== PLATFORM STATISTICS ========== */
const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await adminService.getPlatformStats();
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Get platform stats controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== NOTIFICATION MANAGEMENT ========== */
const sendNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const notificationData: CreateNotificationData = {
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      relatedId: req.body.relatedId,
      relatedType: req.body.relatedType
    };

    if (!notificationData.userId || !notificationData.title || !notificationData.type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and type are required'
      });
    }

    const result = await adminService.sendNotification(notificationData);
    handleServiceResponse(res, result);
  } catch (error: any) {
    console.error('Send notification controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== EXPORT ========== */
export const adminController = {
  // User Management
  getAllUsers,
  updateUser,
  deleteUser,
  
  // Tutor Management
  getAllTutors,
  updateTutorProfile,
  deleteTutor,
  
  // Category Management
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Booking Management
  getAllBookings,
  updateBooking,
  
  // Review Management
  getAllReviews,
  updateReview,
  deleteReview,
  
  // Platform Stats
  getPlatformStats,
  
  // Notification Management
  sendNotification
};