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
import { BookingStatus } from "@prisma/client";

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
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    if (role) where.role = role;
    if (status) where.status = status;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

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

    const totalUsers = await prisma.user.count({ where });

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

    return createSuccessResponse('Users retrieved successfully', usersWithDetails, pagination);
  } catch {
    return createErrorResponse('Failed to retrieve users');
  }
};

const updateUser = async (userId: string, data: UpdateUserData): Promise<ServiceResponse> => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) return createErrorResponse('User not found');

    if (data.role && !['STUDENT', 'TUTOR', 'ADMIN'].includes(data.role)) {
      return createErrorResponse('Invalid role');
    }

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

    return createSuccessResponse('User updated successfully', updatedUser);
  } catch {
    return createErrorResponse('Failed to update user');
  }
};

const deleteUser = async (userId: string): Promise<ServiceResponse> => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) return createErrorResponse('User not found');

    await prisma.user.delete({ where: { id: userId } });

    return createSuccessResponse('User deleted successfully', { userId });
  } catch {
    return createErrorResponse('Failed to delete user');
  }
};

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
    const where: any = {};

    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' as const } },
        { bio: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (minRating !== undefined) where.rating = { gte: minRating };
    if (maxHourlyRate !== undefined) where.hourlyRate = { lte: maxHourlyRate };
    if (experienceYears !== undefined) where.experienceYears = { gte: experienceYears };

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const tutors = await prisma.tutorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
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

    const totalTutors = await prisma.tutorProfile.count({ where });

    const tutorsWithUserInfo = await Promise.all(
      tutors.map(async (tutor) => {
        const user = await prisma.user.findUnique({
          where: { id: tutor.userId },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            emailVerified: true,
            createdAt: true
          }
        });

        return {
          id: tutor.id,
          userId: tutor.userId,
          user,
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
        };
      })
    );

    const pagination = {
      total: totalTutors,
      page,
      limit,
      totalPages: Math.ceil(totalTutors / limit),
      hasNextPage: page * limit < totalTutors,
      hasPrevPage: page > 1
    };

    return createSuccessResponse('Tutors retrieved successfully', tutorsWithUserInfo, pagination);
  } catch {
    return createErrorResponse('Failed to retrieve tutors');
  }
};

const updateTutorProfile = async (tutorId: string, data: UpdateTutorData): Promise<ServiceResponse> => {
  try {
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });

    if (!existingTutor) return createErrorResponse('Tutor not found');

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
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: updatedTutor.userId },
      select: {
        name: true,
        email: true
      }
    });

    return createSuccessResponse('Tutor profile updated successfully', { ...updatedTutor, user });
  } catch {
    return createErrorResponse('Failed to update tutor profile');
  }
};

const deleteTutor = async (tutorId: string): Promise<ServiceResponse> => {
  try {
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });

    if (!existingTutor) return createErrorResponse('Tutor not found');

    await prisma.tutorProfile.delete({ where: { id: tutorId } });

    return createSuccessResponse('Tutor deleted successfully', { tutorId });
  } catch {
    return createErrorResponse('Failed to delete tutor');
  }
};

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
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

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

    const totalCategories = await prisma.category.count({ where });

    const pagination = {
      total: totalCategories,
      page,
      limit,
      totalPages: Math.ceil(totalCategories / limit),
      hasNextPage: page * limit < totalCategories,
      hasPrevPage: page > 1
    };

    return createSuccessResponse('Categories retrieved successfully', categories, pagination);
  } catch {
    return createErrorResponse('Failed to retrieve categories');
  }
};

const createCategory = async (data: CreateCategoryData): Promise<ServiceResponse> => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) return createErrorResponse('Category with this name already exists');

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null
      }
    });

    return createSuccessResponse('Category created successfully', category);
  } catch {
    return createErrorResponse('Failed to create category');
  }
};

const updateCategory = async (categoryId: string, data: UpdateCategoryData): Promise<ServiceResponse> => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) return createErrorResponse('Category not found');

    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: data.name }
      });

      if (nameExists) return createErrorResponse('Category with this name already exists');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description ?? null;

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    return createSuccessResponse('Category updated successfully', updatedCategory);
  } catch {
    return createErrorResponse('Failed to update category');
  }
};

const deleteCategory = async (categoryId: string): Promise<ServiceResponse> => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) return createErrorResponse('Category not found');

    const inUse = await prisma.tutorCategory.count({
      where: { categoryId }
    });

    if (inUse > 0) return createErrorResponse('Cannot delete category that is assigned to tutors');

    await prisma.category.delete({ where: { id: categoryId } });

    return createSuccessResponse('Category deleted successfully', { categoryId });
  } catch {
    return createErrorResponse('Failed to delete category');
  }
};

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
    const where: any = {};

    if (search) {
      where.OR = [
        { meetingLink: { contains: search, mode: 'insensitive' as const } },
        { notes: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (status) where.status = status;

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = startDate;
      if (endDate) where.bookingDate.lte = endDate;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

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

    const totalBookings = await prisma.booking.count({ where });

    const pagination = {
      total: totalBookings,
      page,
      limit,
      totalPages: Math.ceil(totalBookings / limit),
      hasNextPage: page * limit < totalBookings,
      hasPrevPage: page > 1
    };

    return createSuccessResponse('Bookings retrieved successfully', bookingsWithUserInfo, pagination);
  } catch {
    return createErrorResponse('Failed to retrieve bookings');
  }
};

const updateBooking = async (bookingId: string, data: UpdateBookingData): Promise<ServiceResponse> => {
  try {
    const existingBooking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!existingBooking) return createErrorResponse('Booking not found');

    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: updatedBooking.studentUserId },
      select: {
        userId: true,
        grade: true
      }
    });

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: updatedBooking.tutorUserId },
      select: {
        userId: true,
        headline: true
      }
    });

    return createSuccessResponse('Booking updated successfully', { ...updatedBooking, studentProfile, tutorProfile });
  } catch {
    return createErrorResponse('Failed to update booking');
  }
};

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
    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (minRating !== undefined) where.rating = { gte: minRating };
    if (maxRating !== undefined) where.rating = { lte: maxRating };
    if (isVerified !== undefined) where.isVerified = isVerified;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

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

    const totalReviews = await prisma.review.count({ where });

    const pagination = {
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
      hasNextPage: page * limit < totalReviews,
      hasPrevPage: page > 1
    };

    return createSuccessResponse('Reviews retrieved successfully', reviewsWithUserInfo, pagination);
  } catch {
    return createErrorResponse('Failed to retrieve reviews');
  }
};

const updateReview = async (reviewId: string, data: UpdateReviewData): Promise<ServiceResponse> => {
  try {
    const existingReview = await prisma.review.findUnique({ 
      where: { id: reviewId },
      include: {
        tutorProfile: {
          select: {
            userId: true,
            id: true
          }
        }
      }
    });

    if (!existingReview) return createErrorResponse('Review not found');

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      return createErrorResponse('Rating must be between 1 and 5');
    }

    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        tutorProfile: {
          select: {
            userId: true
          }
        }
      }
    });

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: updatedReview.studentUserId },
      select: {
        userId: true
      }
    });

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: updatedReview.tutorProfile.userId },
      select: {
        userId: true,
        headline: true
      }
    });

    if (data.rating !== undefined) {
      await updateTutorRating(updatedReview.tutorProfile.userId);
    }

    return createSuccessResponse('Review updated successfully', { 
      ...updatedReview, 
      studentProfile, 
      tutorProfile 
    });
  } catch {
    return createErrorResponse('Failed to update review');
  }
};

const deleteReview = async (reviewId: string): Promise<ServiceResponse> => {
  try {
    const existingReview = await prisma.review.findUnique({ 
      where: { id: reviewId },
      include: {
        tutorProfile: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!existingReview) return createErrorResponse('Review not found');

    const tutorUserId = existingReview.tutorProfile.userId;

    await prisma.review.delete({ where: { id: reviewId } });

    await updateTutorRating(tutorUserId);

    return createSuccessResponse('Review deleted successfully', { reviewId });
  } catch {
    return createErrorResponse('Failed to delete review');
  }
};

const updateTutorRating = async (tutorUserId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutorProfile) return;

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
  } catch {
    return;
  }
};

const getPlatformStats = async (): Promise<ServiceResponse<PlatformStats>> => {
  try {
    const now = new Date();

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
      recentUsers: [],
      recentBookings: [],
      recentRevenue: []
    };

    return createSuccessResponse('Platform statistics retrieved successfully', stats);
  } catch {
    return createErrorResponse('Failed to retrieve platform statistics');
  }
};

const sendNotification = async (data: CreateNotificationData): Promise<ServiceResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) return createErrorResponse('User not found');

    const validTypes = ['BOOKING', 'REVIEW', 'PAYMENT', 'SYSTEM', 'REMINDER'];
    if (!validTypes.includes(data.type)) return createErrorResponse('Invalid notification type');

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

    return createSuccessResponse('Notification sent successfully', notification);
  } catch {
    return createErrorResponse('Failed to send notification');
  }
};

export const adminService = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTutors,
  updateTutorProfile,
  deleteTutor,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllBookings,
  updateBooking,
  getAllReviews,
  updateReview,
  deleteReview,
  getPlatformStats,
  sendNotification
};