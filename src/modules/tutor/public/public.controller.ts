// modules/tutor/public/public.controller.ts
import { Request, Response } from 'express';
import { publicTutorService } from './public.service';

/* ========== BROWSE/SEARCH TUTORS ========== */
const browseTutors = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering/searching
    const {
      page = '1',
      limit = '10',
      search,
      category,
      minRating,
      maxHourlyRate,
      experienceYears,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      category: category as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate as string) : undefined,
      experienceYears: experienceYears ? parseInt(experienceYears as string) : undefined,
      sortBy: sortBy as 'rating' | 'hourlyRate' | 'experienceYears' | 'totalReviews',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await publicTutorService.browseTutors(filters);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Browse tutors controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to browse tutors',
      data: null
    });
  }
};

/* ========== GET SPECIFIC TUTOR PROFILE ========== */
const getTutorProfile = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    
    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID is required'
      });
    }

    const result = await publicTutorService.getTutorProfile(tutorId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Get tutor profile controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor profile',
      data: null
    });
  }
};

/* ========== GET TUTOR AVAILABILITY ========== */
const getTutorAvailability = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID is required'
      });
    }

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const result = await publicTutorService.getTutorAvailability(tutorId, filters);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Get tutor availability controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor availability',
      data: null
    });
  }
};

/* ========== EXPORT ========== */
export const publicTutorController = {
  browseTutors,
  getTutorProfile,
  getTutorAvailability
};