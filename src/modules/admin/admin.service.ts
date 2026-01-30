import { prisma } from "../../lib/prisma";
import {
  UserFilters,
  TutorFilters,
  BookingFilters,
  CategoryFilters,
  ReviewFilters,
  UpdateUserData,
  UpdateTutorData,
  UpdateCategoryData,
  UpdateBookingData,
  UpdateReviewData,
  CreateCategoryData,
  CreateNotificationData,
  PlatformStats,
  ServiceResponse,
  ServiceSuccessResponse
} from "./admin.types";

/* ========== HELPER FUNCTIONS ========== */
const createSuccessResponse = <T>(
  message: string,
  data: T,
  pagination?: any
): ServiceSuccessResponse<T> => ({
  success: true,
  message,
  data,
  pagination
});

const createErrorResponse = (message: string): ServiceResponse => ({
  success: false,
  message
});

/* ========== USER MANAGEMENT ========== */
const getAllUsers = async (filters: UserFilters = {}): Promise<ServiceResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            accounts: true
          }
        }
      }
    });

    // Get total count
    const totalUsers = await prisma.user.count({ where });

    // Get additional info for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        let profile: any = null;
        
        if (user.role === 'TUTOR') {
          profile = await prisma.tutorProfile.findUnique({
            where: { userId: user.id },
            select: {
              id: true,
              headline: true,
              rating: true,
              totalReviews: true,
              hourlyRate: true
            }
          });
        } else if (user.role === 'STUDENT') {
          profile = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            select: {
              id: true,
              grade: true
            }
          });
        }

        return {
          ...user,
          profile
        };
      })
    );

    const pagination = {
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPrevPage: page > 1
    };

    return createSuccessResponse(
      'Users retrieved successfully',
      usersWithDetails,
      pagination
    );
  } catch (error: any) {
    console.error('Get all users service error:', error);
    return createErrorResponse('Failed to retrieve users');
  }
};

const updateUser = async (userId: string, data: UpdateUserData): Promise<ServiceResponse> => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    // Validate role if changing
    if (data.role && !['STUDENT', 'TUTOR', 'ADMIN'].includes(data.role)) {
      return createErrorResponse('Invalid role');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role,
        status: data.status,
        emailVerified: data.emailVerified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    return createSuccessResponse(
      'User updated successfully',
      updatedUser
    );
  } catch (error: any) {
    console.error('Update user service error:', error);
    return createErrorResponse('Failed to update user');
  }
};

const deleteUser = async (userId: string): Promise<ServiceResponse> => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return createSuccessResponse(
      'User deleted successfully',
      { userId }
    );
  } catch (error: any) {
    console.error('Delete user service error:', error);
    return createErrorResponse('Failed to delete user');
  }
};

/* ========== TUTOR MANAGEMENT ========== */
const getAllTutors = async (filters: TutorFilters = {}): Promise<ServiceResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      minRating,
      maxHourlyRate,
      experienceYears,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { headline: { contains: search, mode: 'insensitive' as const } },
        { bio: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (maxHourlyRate !== undefined) {
      where.hourlyRate = { lte: maxHourlyRate };
    }

    if (experienceYears !== undefined) {
      where.experienceYears = { gte: experienceYears };
    }

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get tutors with user info
    const tutors = await prisma.tutorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            emailVerified: true,
            createdAt: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            availabilitySlots: true
          }
        }
      }
    });

    // Get total count
    const totalTutors = await prisma.tutorProfile.count({ where });

    const formattedTutors = tutors.map(tutor => ({
      id: tutor.id,
      userId: tutor.userId,
      user: tutor.user,
      headline: tutor.headline,
      bio: tutor.bio,
      hourlyRate: tutor.hourlyRate,
      experienceYears: tutor.experienceYears,
      education: tutor.education,
      certifications: tutor.certifications,
      rating: tutor.rating,
      totalReviews: tutor.totalReviews,
      completedSessions: tutor.completedSessions,
      categories: tutor.categories.map(tc => tc.category),
      stats: tutor._count,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt
    }));

    const pagination = {
      total: totalTutors,
      page,
      limit,
      totalPages: Math.ceil(totalTutors / limit),
      hasNextPage: page * limit < totalTutors,
      hasPrevPage: page > 1
    };

    return createSuccessResponse(
      'Tutors retrieved successfully',
      formattedTutors,
      pagination
    );
  } catch (error: any) {
    console.error('Get all tutors service error:', error);
    return createErrorResponse('Failed to retrieve tutors');
  }
};

const updateTutorProfile = async (tutorId: string, data: UpdateTutorData): Promise<ServiceResponse> => {
  try {
    // Check if tutor exists
    const existingTutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorId }
    });

    if (!existingTutor) {
      return createErrorResponse('Tutor not found');
    }

    // Update tutor profile
    const updatedTutor = await prisma.tutorProfile.update({
      where: { id: tutorId },
      data: {
        headline: data.headline,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        experienceYears: data.experienceYears,
        education: data.education,
        certifications: data.certifications,
        rating: data.rating,
        totalReviews: data.totalReviews,
        completedSessions: data.completedSessions
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return createSuccessResponse(
      'Tutor profile updated successfully',
      updatedTutor
    );
  } catch (error: any) {
    console.error('Update tutor profile service error:', error);
    return createErrorResponse('Failed to update tutor profile');
  }
};

const deleteTutor = async (tutorId: string): Promise<ServiceResponse> => {
  try {
    // Check if tutor exists
    const existingTutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorId }
    });

    if (!existingTutor) {
      return createErrorResponse('Tutor not found');
    }

    // Delete tutor profile (cascade will handle related records)
    await prisma.tutorProfile.delete({
      where: { id: tutorId }
    });

    return createSuccessResponse(
      'Tutor deleted successfully',
      { tutorId }
    );
  } catch (error: any) {
    console.error('Delete tutor service error:', error);
    return createErrorResponse('Failed to delete tutor');
  }
};

/* ========== CATEGORY MANAGEMENT ========== */
const getAllCategories = async (filters: CategoryFilters = {}): Promise<ServiceResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: {
            tutorCategories: true,
            bookings: true
          }
        }
      }
    });

    // Get total count
    const totalCategories = await prisma.category.count({ where });

    const pagination = {
      total: totalCategories,
      page,
      limit,
      totalPages: Math.ceil(totalCategories / limit),
      hasNextPage: page * limit < totalCategories,
      hasPrevPage: page > 1
    };

    return createSuccessResponse(
      'Categories retrieved successfully',
      categories,
      pagination
    );
  } catch (error: any) {
    console.error('Get all categories service error:', error);
    return createErrorResponse('Failed to retrieve categories');
  }
};

const createCategory = async (data: CreateCategoryData): Promise<ServiceResponse> => {
  try {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) {
      return createErrorResponse('Category with this name already exists');
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description
      }
    });

    return createSuccessResponse(
      'Category created successfully',
      category
    );
  } catch (error: any) {
    console.error('Create category service error:', error);
    return createErrorResponse('Failed to create category');
  }
};

const updateCategory = async (categoryId: string, data: UpdateCategoryData): Promise<ServiceResponse> => {
  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return createErrorResponse('Category not found');
    }

    // Check if new name already exists
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        return createErrorResponse('Category with this name already exists');
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description
      }
    });

    return createSuccessResponse(
      'Category updated successfully',
      updatedCategory
    );
  } catch (error: any) {
    console.error('Update category service error:', error);
    return createErrorResponse('Failed to update category');
  }
};

const deleteCategory = async (categoryId: string): Promise<ServiceResponse> => {
  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return createErrorResponse('Category not found');
    }

    // Check if category is in use
    const inUse = await prisma.tutorCategory.count({
      where: { categoryId }
    });

    if (inUse > 0) {
      return createErrorResponse('Cannot delete category that is assigned to tutors');
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return createSuccessResponse(
      'Category deleted successfully',
      { categoryId }
    );
  } catch (error: any) {
    console.error('Delete category service error:', error);
    return createErrorResponse('Failed to delete category');
  }
};

/* ========== BOOKING MANAGEMENT ========== */
const getAllBookings = async (filters: BookingFilters = {}): Promise<ServiceResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy = 'bookingDate',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { studentUser: { name: { contains: search, mode: 'insensitive' as const } } },
        { tutorUser: { name: { contains: search, mode: 'insensitive' as const } } },
        { meetingLink: { contains: search, mode: 'insensitive' as const } },
        { notes: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = startDate;
      if (endDate) where.bookingDate.lte = endDate;
    }

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get bookings with related data
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true
          }
        },
        tutorProfile: {
          select: {
            id: true,
            userId: true,
            headline: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        availabilitySlot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true
          }
        }
      }
    });

    // Get user info for bookings
    const bookingsWithUserInfo = await Promise.all(
      bookings.map(async (booking) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        const tutorUser = await prisma.user.findUnique({
          where: { id: booking.tutorUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        return {
          ...booking,
          studentUser,
          tutorUser
        };
      })
    );

    // Get total count
    const totalBookings = await prisma.booking.count({ where });

    const pagination = {
      total: totalBookings,
      page,
      limit,
      totalPages: Math.ceil(totalBookings / limit),
      hasNextPage: page * limit < totalBookings,
      hasPrevPage: page > 1
    };

    return createSuccessResponse(
      'Bookings retrieved successfully',
      bookingsWithUserInfo,
      pagination
    );
  } catch (error: any) {
    console.error('Get all bookings service error:', error);
    return createErrorResponse('Failed to retrieve bookings');
  }
};

const updateBooking = async (bookingId: string, data: UpdateBookingData): Promise<ServiceResponse> => {
  try {
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return createErrorResponse('Booking not found');
    }

    // Validate status if changing
    if (data.status && !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(data.status)) {
      return createErrorResponse('Invalid booking status');
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status,
        amount: data.amount,
        isPaid: data.isPaid,
        meetingLink: data.meetingLink,
        notes: data.notes
      },
      include: {
        studentProfile: {
          select: {
            userId: true,
            grade: true
          }
        },
        tutorProfile: {
          select: {
            userId: true,
            headline: true
          }
        }
      }
    });

    return createSuccessResponse(
      'Booking updated successfully',
      updatedBooking
    );
  } catch (error: any) {
    console.error('Update booking service error:', error);
    return createErrorResponse('Failed to update booking');
  }
};

/* ========== REVIEW MANAGEMENT ========== */
const getAllReviews = async (filters: ReviewFilters = {}): Promise<ServiceResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      minRating,
      maxRating,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' as const } },
        { studentUser: { name: { contains: search, mode: 'insensitive' as const } } },
        { tutorUser: { name: { contains: search, mode: 'insensitive' as const } } }
      ];
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (maxRating !== undefined) {
      where.rating = { lte: maxRating };
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get reviews
    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true
          }
        },
        tutorProfile: {
          select: {
            id: true,
            userId: true,
            headline: true,
            rating: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            amount: true
          }
        }
      }
    });

    // Get user info for reviews
    const reviewsWithUserInfo = await Promise.all(
      reviews.map(async (review) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: review.studentUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        const tutorUser = await prisma.user.findUnique({
          where: { id: review.tutorProfile.userId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        return {
          ...review,
          studentUser,
          tutorUser
        };
      })
    );

    // Get total count
    const totalReviews = await prisma.review.count({ where });

    const pagination = {
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
      hasNextPage: page * limit < totalReviews,
      hasPrevPage: page > 1
    };

    return createSuccessResponse(
      'Reviews retrieved successfully',
      reviewsWithUserInfo,
      pagination
    );
  } catch (error: any) {
    console.error('Get all reviews service error:', error);
    return createErrorResponse('Failed to retrieve reviews');
  }
};

const updateReview = async (reviewId: string, data: UpdateReviewData): Promise<ServiceResponse> => {
  try {
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return createErrorResponse('Review not found');
    }

    // Validate rating if changing
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      return createErrorResponse('Rating must be between 1 and 5');
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
        isVerified: data.isVerified
      },
      include: {
        studentProfile: {
          select: {
            userId: true
          }
        },
        tutorProfile: {
          select: {
            userId: true,
            headline: true
          }
        }
      }
    });

    // If rating changed, update tutor's average rating
    if (data.rating !== undefined) {
      await updateTutorRating(updatedReview.tutorProfile.userId);
    }

    return createSuccessResponse(
      'Review updated successfully',
      updatedReview
    );
  } catch (error: any) {
    console.error('Update review service error:', error);
    return createErrorResponse('Failed to update review');
  }
};

const deleteReview = async (reviewId: string): Promise<ServiceResponse> => {
  try {
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return createErrorResponse('Review not found');
    }

    const tutorUserId = existingReview.tutorProfile.userId;

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update tutor's average rating
    await updateTutorRating(tutorUserId);

    return createSuccessResponse(
      'Review deleted successfully',
      { reviewId }
    );
  } catch (error: any) {
    console.error('Delete review service error:', error);
    return createErrorResponse('Failed to delete review');
  }
};

/* ========== HELPER FUNCTIONS ========== */
const updateTutorRating = async (tutorUserId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutorProfile) return;

    // Calculate new average rating
    const reviews = await prisma.review.findMany({
      where: { tutorProfileId: tutorProfile.id }
    });

    if (reviews.length === 0) {
      await prisma.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: {
          rating: 0,
          totalReviews: 0
        }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.tutorProfile.update({
      where: { id: tutorProfile.id },
      data: {
        rating: averageRating,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Update tutor rating error:', error);
  }
};

/* ========== PLATFORM STATISTICS ========== */
const getPlatformStats = async (): Promise<ServiceResponse<PlatformStats>> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    // Get all counts in parallel
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalAdmins,
      totalBookings,
      totalRevenueResult,
      activeBookings,
      pendingBookings,
      totalCategories,
      totalReviews,
      averageRatingResult
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TUTOR' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { isPaid: true },
        _sum: { amount: true }
      }),
      prisma.booking.count({
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          bookingDate: { gte: now }
        }
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.category.count(),
      prisma.review.count(),
      prisma.tutorProfile.aggregate({
        _avg: { rating: true }
      })
    ]);

    // Get recent users (last 30 days)
    const recentUsersData = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    // Get recent bookings (last 30 days)
    const recentBookingsData = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        bookingDate: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    // Get recent revenue (last 30 days)
    const recentRevenueData = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        bookingDate: { gte: thirtyDaysAgo },
        isPaid: true
      },
      _sum: { amount: true }
    });

    // Format recent data
    const recentUsers = recentUsersData.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    const recentBookings = recentBookingsData.map(item => ({
      date: item.bookingDate.toISOString().split('T')[0],
      count: item._count.id
    }));

    const recentRevenue = recentRevenueData.map(item => ({
      date: item.bookingDate.toISOString().split('T')[0],
      amount: item._sum.amount || 0
    }));

    const stats: PlatformStats = {
      totalUsers,
      totalTutors,
      totalStudents,
      totalAdmins,
      totalBookings,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      activeBookings,
      pendingBookings,
      totalCategories,
      totalReviews,
      averageRating: averageRatingResult._avg.rating || 0,
      recentUsers,
      recentBookings,
      recentRevenue
    };

    return createSuccessResponse(
      'Platform statistics retrieved successfully',
      stats
    );
  } catch (error: any) {
    console.error('Get platform stats service error:', error);
    return createErrorResponse('Failed to retrieve platform statistics');
  }
};

/* ========== NOTIFICATION MANAGEMENT ========== */
const sendNotification = async (data: CreateNotificationData): Promise<ServiceResponse> => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      return createErrorResponse('User not found');
    }

    // Validate notification type
    const validTypes = ['BOOKING', 'REVIEW', 'PAYMENT', 'SYSTEM', 'REMINDER'];
    if (!validTypes.includes(data.type)) {
      return createErrorResponse('Invalid notification type');
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as any,
        relatedId: data.relatedId,
        relatedType: data.relatedType
      }
    });

    return createSuccessResponse(
      'Notification sent successfully',
      notification
    );
  } catch (error: any) {
    console.error('Send notification service error:', error);
    return createErrorResponse('Failed to send notification');
  }
};

/* ========== EXPORT ========== */
export const adminService = {
  // User Management
  getAllUsers,
  updateUser,
  deleteUser,
  
  // Tutor Management
  getAllTutors,
  updateTutorProfile,
  deleteTutor,
  
  // Category Management
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Booking Management
  getAllBookings,
  updateBooking,
  
  // Review Management
  getAllReviews,
  updateReview,
  deleteReview,
  
  // Platform Stats
  getPlatformStats,
  
  // Notification Management
  sendNotification
};