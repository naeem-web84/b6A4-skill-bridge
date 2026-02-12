// modules/studentCategories/studentCategory.service.ts
import { prisma } from "../../lib/prisma";

/* ========== TYPES ========== */
interface TutorFilters {
  page?: number;
  limit?: number;
  minRating?: number;
  maxHourlyRate?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/* ========== GET ALL CATEGORIES ========== */
const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    };
  } catch (error: any) {
    console.error('Get categories service error:', error);
    return {
      success: false,
      message: 'Failed to fetch categories',
      data: []
    };
  }
};

/* ========== GET CATEGORY BY ID ========== */
const getCategoryById = async (categoryId: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tutorCategories: true,
            bookings: true
          }
        }
      }
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: {
        ...category,
        tutorCount: category._count.tutorCategories,
        bookingCount: category._count.bookings
      },
      message: 'Category fetched successfully'
    };
  } catch (error: any) {
    console.error('Get category by ID service error:', error);
    return {
      success: false,
      message: 'Failed to fetch category',
      statusCode: 500
    };
  }
};

/* ========== GET TUTORS BY CATEGORY ========== */
const getTutorsByCategory = async (categoryId: string, filters: TutorFilters) => {
  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404
      };
    }

    // Build where conditions
    const whereConditions: any = {
      tutorCategories: {
        some: {
          categoryId
        }
      }
    };

    // Apply filters
    if (filters.minRating) {
      whereConditions.rating = {
        gte: filters.minRating
      };
    }

    if (filters.maxHourlyRate) {
      whereConditions.hourlyRate = {
        lte: filters.maxHourlyRate
      };
    }

    // Determine sort order
    const orderBy: any = {};
    if (filters.sortBy === 'hourlyRate') {
      orderBy.hourlyRate = filters.sortOrder || 'desc';
    } else if (filters.sortBy === 'experienceYears') {
      orderBy.experienceYears = filters.sortOrder || 'desc';
    } else {
      orderBy.rating = filters.sortOrder || 'desc';
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Get tutors
    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where: whereConditions,
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.tutorProfile.count({ where: whereConditions })
    ]);

    // Format response
    const formattedTutors = tutors.map((tutor: any) => ({
      id: tutor.id,
      userId: tutor.userId,
      name: tutor.name || 'Unknown',
      email: tutor.email || '',
      image: tutor.image || null,
      headline: tutor.headline,
      bio: tutor.bio,
      hourlyRate: tutor.hourlyRate,
      rating: tutor.rating,
      totalReviews: tutor.totalReviews,
      experienceYears: tutor.experienceYears,
      education: tutor.education,
      certifications: tutor.certifications,
      completedSessions: tutor.completedSessions,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      categories: tutor.categories.map(tc => tc.category)
    }));

    return {
      success: true,
      data: {
        category,
        tutors: formattedTutors,
        statistics: {
          totalTutors: total,
          averageRating: tutors.length > 0 
            ? tutors.reduce((sum, tutor) => sum + tutor.rating, 0) / tutors.length 
            : 0,
          averageHourlyRate: tutors.length > 0 
            ? tutors.reduce((sum, tutor) => sum + tutor.hourlyRate, 0) / tutors.length 
            : 0
        }
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Tutors fetched successfully'
    };
  } catch (error: any) {
    console.error('Get tutors by category service error:', error);
    return {
      success: false,
      message: 'Failed to fetch tutors',
      statusCode: 500,
      data: {
        category: null,
        tutors: [],
        statistics: {
          totalTutors: 0,
          averageRating: 0,
          averageHourlyRate: 0
        }
      },
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
};

/* ========== EXPORT ========== */
export const studentCategoryService = {
  getAllCategories,
  getCategoryById,
  getTutorsByCategory
};