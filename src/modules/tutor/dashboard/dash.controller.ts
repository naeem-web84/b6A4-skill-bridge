// modules/tutor/dashboard/dashboard.controller.ts
import { Request, Response } from 'express'; 
import { dashboardService } from './dash.service';

// Type definitions for service responses
interface ServiceSuccessResponse {
  success: true;
  message: string;
  data: any;
}

interface ServiceErrorResponse {
  success: false;
  message: string;
}

type ServiceResponse = ServiceSuccessResponse | ServiceErrorResponse;

/* ========== GET DASHBOARD STATISTICS ========== */
const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await dashboardService.getDashboardStats(userId) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error getting dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== GET UPCOMING SESSIONS ========== */
const getUpcomingSessions = async (req: Request, res: Response) => {
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
      days = '7',
      limit = '10'
    } = req.query;

    const filters: any = {};
    if (days) filters.days = parseInt(days as string);
    if (limit) filters.limit = parseInt(limit as string);

    const result = await dashboardService.getUpcomingSessions(userId, filters) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error getting upcoming sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== EXPORT ========== */
export const dashboardController = {
  getDashboardStats,
  getUpcomingSessions
};