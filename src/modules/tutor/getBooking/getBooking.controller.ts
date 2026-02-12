 
import { Request, Response } from 'express';
import { getBookingService } from './getBooking.service';
import { BookingStatus } from '../../../../generated/prisma/enums';
 
const getAllTutorBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
 
 
    const {
      status,
      categoryId,
      studentName,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      sortBy = 'bookingDate',
      sortOrder = 'desc',
      search,
      isPaid,
      includeStudentDetails = 'true'
    } = req.query;
 
    const filters: any = {};
     
    if (status) {
      if (status === 'all') {
        filters.status = 'all';
      } else if (Object.values(BookingStatus).includes(status as BookingStatus)) {
        filters.status = status as BookingStatus;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
      }
    } 
    if (categoryId) filters.categoryId = categoryId as string;
    if (studentName) filters.studentName = studentName as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);
    if (sortBy) filters.sortBy = sortBy as string;
    if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
    if (search) filters.search = search as string;
    if (isPaid !== undefined) filters.isPaid = isPaid === 'true';
    
    filters.includeStudentDetails = includeStudentDetails === 'true';
 

    const result = await getBookingService.getTutorAllBookings(userId, filters);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
 
const getTutorBookingStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
 

    const result = await getBookingService.getTutorBookingStats(userId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Statistics fetched successfully',
      data: result.data
    });

  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
const getPendingBookingsCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await getBookingService.getPendingBookingsCount(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
export const getBookingController = {
  getAllTutorBookings,
  getTutorBookingStats,
  getPendingBookingsCount
};