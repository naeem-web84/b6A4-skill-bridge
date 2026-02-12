 
import { prisma } from "../../../lib/prisma";
 
interface AddTeachingCategoryInput {
  categoryId: string;
  proficiencyLevel?: string;
}
 
const addTeachingCategory = async (userId: string, data: AddTeachingCategoryInput) => {
  try { 
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }
 
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found'
      };
    }
 
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
 
    const tutorCategory = await prisma.tutorCategory.create({
      data: {
        tutorProfileId: tutorProfile.id,
        categoryId: data.categoryId,
        proficiencyLevel: data.proficiencyLevel ?? null
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
    return {
      success: false,
      message: error.message || 'Failed to add teaching category'
    };
  }
};
 
const getTutorCategories = async (userId: string) => {
  try { 
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }
 
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
    return {
      success: false,
      message: 'Failed to get tutor categories',
      data: []
    };
  }
};
 
const removeTeachingCategory = async (userId: string, categoryId: string) => {
  try { 
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      return {
        success: false,
        message: 'Tutor profile not found'
      };
    }
 
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
 
    await prisma.tutorCategory.delete({
      where: { id: tutorCategory.id }
    });

    return {
      success: true,
      message: 'Category removed successfully'
    };
  } catch (error: any) { 
    return {
      success: false,
      message: error.message || 'Failed to remove teaching category'
    };
  }
};
 
export const categoryService = {
  addTeachingCategory,
  getTutorCategories,
  removeTeachingCategory
};