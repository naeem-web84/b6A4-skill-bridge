 
import { Request, Response } from 'express';
import { studentCategoryService } from './studentCategory.service';
 
const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await studentCategoryService.getAllCategories();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId || Array.isArray(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const result = await studentCategoryService.getCategoryById(categoryId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
const getTutorsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId || Array.isArray(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const {
      page = '1',
      limit = '10',
      minRating,
      maxHourlyRate,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as string
    };

    if (minRating) filters.minRating = parseFloat(minRating as string);
    if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate as string);

    const result = await studentCategoryService.getTutorsByCategory(categoryId, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) { 
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
 
export const studentCategoryController = {
  getAllCategories,
  getCategoryById,
  getTutorsByCategory
};