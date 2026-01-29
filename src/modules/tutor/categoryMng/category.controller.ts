// modules/tutor/categoryMng/category.controller.ts
import { Request, Response } from 'express';
import { categoryService } from './category.service';

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

/* ========== ADD TEACHING CATEGORY ========== */
const addTeachingCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { categoryId, proficiencyLevel } = req.body;

    // Validate required fields
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'categoryId is required'
      });
    }

    const result = await categoryService.addTeachingCategory(userId, {
      categoryId,
      proficiencyLevel
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
    console.error('Controller error adding teaching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== GET TUTOR'S CATEGORIES ========== */
const getTutorCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await categoryService.getTutorCategories(userId) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error: any) {
    console.error('Controller error getting tutor categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== REMOVE TEACHING CATEGORY ========== */
const removeTeachingCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { categoryId } = req.params;
    
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

    const result = await categoryService.removeTeachingCategory(userId, categoryId) as ServiceResponse;
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const successResult = result as ServiceSuccessResponse;
    return res.status(200).json({
      success: true,
      message: successResult.message
    });
  } catch (error: any) {
    console.error('Controller error removing teaching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/* ========== EXPORT ========== */
export const categoryController = {
  addTeachingCategory,
  getTutorCategories,
  removeTeachingCategory
};