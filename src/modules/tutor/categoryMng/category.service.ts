// modules/tutor/categoryMng/category.service.ts
import { prisma } from "../../../lib/prisma";

/* ========== TYPES ========== */
interface AddTeachingCategoryInput {
  categoryId: string;
  proficiencyLevel?: string;
}

/* ========== ADD TEACHING CATEGORY ========== */
const addTeachingCategory = async (userId: string, data: AddTeachingCategoryInput) => {
  try {
    // Get tutor profile first
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found'
      };
    }

    // Check if tutor already has this category
    const existingTutorCategory = await prisma.tutorCategory.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        categoryId: data.categoryId
      }
    });

    if (existingTutorCategory) {
      return {
        success: false,
        message: 'You already have this category added'
      };
    }

    // Create tutor-category relationship
    const tutorCategory = await prisma.tutorCategory.create({
      data: {
        tutorProfileId: tutorProfile.id,
        categoryId: data.categoryId,
        proficiencyLevel: data.proficiencyLevel
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Category added successfully',
      data: tutorCategory
    };
  } catch (error: any) {
    console.error('Add teaching category error:', error);
    return {
      success: false,
      message: error.message || 'Failed to add teaching category'
    };
  }
};

/* ========== GET TUTOR'S CATEGORIES ========== */
const getTutorCategories = async (userId: string) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    // Get all tutor categories with category details
    const tutorCategories = await prisma.tutorCategory.findMany({
      where: {
        tutorProfileId: tutorProfile.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const categories = tutorCategories.map(tc => ({
      id: tc.id,
      proficiencyLevel: tc.proficiencyLevel,
      addedAt: tc.createdAt,
      category: tc.category
    }));

    return {
      success: true,
      data: categories
    };
  } catch (error: any) {
    console.error('Get tutor categories error:', error);
    return {
      success: false,
      message: 'Failed to get tutor categories',
      data: []
    };
  }
};

/* ========== REMOVE TEACHING CATEGORY ========== */
const removeTeachingCategory = async (userId: string, categoryId: string) => {
  try {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }

    // Find the tutor-category relationship
    const tutorCategory = await prisma.tutorCategory.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        id: categoryId
      }
    });

    if (!tutorCategory) {
      return {
        success: false,
        message: 'Category not found in your teaching categories'
      };
    }

    // Check if this category has any bookings
    const existingBookings = await prisma.booking.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        categoryId: tutorCategory.categoryId,
        status: {
          notIn: ['CANCELLED', 'COMPLETED']
        }
      }
    });

    if (existingBookings) {
      return {
        success: false,
        message: 'Cannot remove category with active or pending bookings'
      };
    }

    // Delete the tutor-category relationship
    await prisma.tutorCategory.delete({
      where: { id: tutorCategory.id }
    });

    return {
      success: true,
      message: 'Category removed successfully'
    };
  } catch (error: any) {
    console.error('Remove teaching category error:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove teaching category'
    };
  }
};

/* ========== EXPORT ========== */
export const categoryService = {
  addTeachingCategory,
  getTutorCategories,
  removeTeachingCategory
};