// modules/tutor/bookingMng/booking.controller.ts
import { Request, Response } from 'express';
import { bookingService } from './booking.service'; 
import { BookingStatus } from '../../../../generated/prisma/enums';

/* Get Tutor's Bookings */
const getTutorBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Parse query parameters
    const {
      status,
      studentId,
      startDate,
      endDate,
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
    
    if (studentId) filters.studentId = studentId as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);

    const result = await bookingService.getTutorBookings(userId, filters);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('Controller error getting bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Get Single Booking Details */
const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    
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

    const result = await bookingService.getBookingById(userId, bookingId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error: any) {
    console.error('Controller error getting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Update Booking Status */
const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    
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

    const { status, notes, meetingLink } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    const result = await bookingService.updateBookingStatus(userId, bookingId, {
      status,
      notes,
      meetingLink
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error: any) {
    console.error('Controller error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Get Booking Statistics */
const getBookingStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await bookingService.getBookingStats(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error: any) {
    console.error('Controller error getting booking stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* Export */
export const bookingController = {
  getTutorBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats
};