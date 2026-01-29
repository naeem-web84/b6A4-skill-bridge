// modules/student/student.controller.ts
import { Request, Response } from 'express';
import { studentService } from './student.service'; 
import { BookingStatus } from '../../../generated/prisma/enums';

// Type definitions for service responses
interface ServiceSuccessResponse {
  success: true;
  message: string;
  data: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ServiceErrorResponse {
  success: false;
  message: string;
}

type ServiceResponse = ServiceSuccessResponse | ServiceErrorResponse;

/* ========== PROFILE CONTROLLERS ========== */

// ✅ ADDED: Create Student Profile
const createStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await studentService.createStudentProfile(userId) as ServiceResponse;

    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(201).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error creating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await studentService.getStudentProfile(userId) as ServiceResponse;
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error getting student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { grade, subjects } = req.body;

    const result = await studentService.updateStudentProfile(userId, {
      grade,
      subjects
    }) as ServiceResponse;

    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error updating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== BOOKING CONTROLLERS ========== */
const createBooking = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      tutorProfileId,
      availabilitySlotId,
      categoryId,
      notes
    } = req.body;

    // Validate required fields
    if (!tutorProfileId || !availabilitySlotId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'tutorProfileId, availabilitySlotId, and categoryId are required'
      });
    }

    const result = await studentService.createBooking(studentUserId, {
      tutorProfileId,
      availabilitySlotId,
      categoryId,
      notes
    }) as ServiceResponse;

    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(201).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStudentBookings = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Parse query parameters
    const {
      status,
      page = '1',
      limit = '10'
    } = req.query;

    const filters: any = {};
    
    if (status) {
      if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
      }
      filters.status = status as BookingStatus;
    }
    
    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);

    const result = await studentService.getStudentBookings(studentUserId, filters) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      data: successResult.data,
      pagination: successResult.pagination
    });
  } catch (error: any) {
    console.error('Controller error getting bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const cancelBooking = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user?.id;
    const { bookingId } = req.params;
    
    if (!studentUserId) {
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

    const result = await studentService.cancelBooking(studentUserId, bookingId) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== EXPORT ========== */
export const studentController = {
  // Profile
  createStudentProfile,  // ✅ ADDED
  getStudentProfile,
  updateStudentProfile,
  
  // Booking
  createBooking,
  getStudentBookings,
  cancelBooking
};