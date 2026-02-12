
import { Request, Response } from 'express';
import { publicTutorService } from './public.service';
 
const browseTutors = async (req: Request, res: Response) => {
  try { 
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

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'rating' | 'hourlyRate' | 'experienceYears' | 'totalReviews',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    if (search) filters.search = search as string;
    if (category) filters.category = category as string;
    if (minRating) filters.minRating = parseFloat(minRating as string);
    if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate as string);
    if (experienceYears) filters.experienceYears = parseInt(experienceYears as string);

    const result = await publicTutorService.browseTutors(filters);
    
    return res.status(200).json(result);
  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Failed to browse tutors',
      data: null
    });
  }
};
 
const getTutorProfile = async (req: Request, res: Response) => {
  try {
    const tutorId = Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId;
    
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
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor profile',
      data: null
    });
  }
};
 
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

    const filters: any = {};
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }

    const result = await publicTutorService.getTutorAvailability(tutorId as string, filters);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Failed to get tutor availability',
      data: null
    });
  }
};
 
export const publicTutorController = {
  browseTutors,
  getTutorProfile,
  getTutorAvailability
};