 
import { Request, Response } from 'express';
import { reviewService } from './review.service';
 
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
 
const getTutorReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
 
    const {
      page = '1',
      limit = '10',
      sortBy = 'newest',
      minRating
    } = req.query;

    const filters: any = {};
    
    if (page) filters.page = parseInt(page as string);
    if (limit) filters.limit = parseInt(limit as string);
    if (sortBy) filters.sortBy = sortBy as string;
    if (minRating) filters.minRating = parseInt(minRating as string);

    const result = await reviewService.getTutorReviews(userId, filters) as ServiceResponse;
    
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
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
export const reviewController = {
  getTutorReviews
};