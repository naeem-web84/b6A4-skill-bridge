 
import { prisma } from "../../lib/prisma";
 
interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

interface GetReviewsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  tutorId?: string;
}
 
const createReview = async (studentUserId: string, data: CreateReviewInput) => {
  try {
    const { bookingId, rating, comment } = data;

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student profile not found',
        statusCode: 404
      };
    }

    // Check booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tutorProfile: {
          select: {
            id: true,
            userId: true,
            headline: true
          }
        },
        studentProfile: true,
        category: true
      }
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
        statusCode: 404
      };
    }

    // Verify ownership
    if (booking.studentUserId !== studentUserId) {
      return {
        success: false,
        message: 'You can only review your own bookings',
        statusCode: 403
      };
    }

    // Check booking status
    if (booking.status !== 'COMPLETED') {
      return {
        success: false,
        message: 'You can only review completed bookings',
        statusCode: 400
      };
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    });

    if (existingReview) {
      return {
        success: false,
        message: 'Review already exists for this booking',
        statusCode: 400
      };
    }

    // Get tutor user info
    const tutorUser = await prisma.user.findUnique({
      where: { id: booking.tutorProfile.userId },
      select: {
        name: true,
        image: true
      }
    });

    // Create review - FIXED: comment || null
    const review = await prisma.review.create({
      data: {
        studentUserId,
        studentProfileId: studentProfile.id,
        tutorProfileId: booking.tutorProfileId,
        bookingId,
        rating,
        comment: comment || null, // Convert undefined to null
        isVerified: true
      }
    });

    // Update tutor's rating stats
    const tutorReviews = await prisma.review.findMany({
      where: { tutorProfileId: booking.tutorProfileId }
    });

    const averageRating = tutorReviews.reduce((sum, rev) => sum + rev.rating, 0) / tutorReviews.length;

    await prisma.tutorProfile.update({
      where: { id: booking.tutorProfileId },
      data: {
        rating: averageRating,
        totalReviews: tutorReviews.length
      }
    });

    return {
      success: true,
      message: 'Review created successfully',
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        booking: {
          id: booking.id,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          tutor: {
            id: booking.tutorProfile.id,
            headline: booking.tutorProfile.headline,
            user: tutorUser
          },
          category: booking.category
        }
      }
    };
  } catch (error: any) {
    console.error('Create review service error:', error);
    return {
      success: false,
      message: 'Failed to create review',
      statusCode: 500
    };
  }
};
 
const getStudentReviews = async (studentUserId: string, filters: GetReviewsFilters) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student profile not found',
        statusCode: 404
      };
    }

    // Build where conditions
    const whereConditions: any = {
      studentUserId
    };

    if (filters.tutorId) {
      const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId: filters.tutorId }
      });
      if (tutorProfile) {
        whereConditions.tutorProfileId = tutorProfile.id;
      }
    }

    // Sort order
    let orderBy: any = {};
    switch (filters.sortBy) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'highest': orderBy = { rating: 'desc' }; break;
      case 'lowest': orderBy = { rating: 'asc' }; break;
      default: orderBy = { createdAt: 'desc' }; break;
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Get reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereConditions,
        include: {
          tutorProfile: {
            select: {
              id: true,
              userId: true,
              headline: true,
              hourlyRate: true,
              rating: true
            }
          },
          booking: {
            include: {
              category: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where: whereConditions })
    ]);

    // Get user info for each tutor
    const reviewsWithUserInfo = await Promise.all(
      reviews.map(async (review) => {
        const tutorUser = await prisma.user.findUnique({
          where: { id: review.tutorProfile.userId },
          select: {
            name: true,
            image: true,
            email: true
          }
        });

        return {
          ...review,
          tutorUser
        };
      })
    );

    // Format response
    const formattedReviews = reviewsWithUserInfo.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isVerified: review.isVerified,
      createdAt: review.createdAt,
      tutor: {
        id: review.tutorProfile.id,
        userId: review.tutorProfile.userId,
        headline: review.tutorProfile.headline,
        hourlyRate: review.tutorProfile.hourlyRate,
        rating: review.tutorProfile.rating,
        user: review.tutorUser
      },
      booking: review.booking ? {
        id: review.booking.id,
        bookingDate: review.booking.bookingDate,
        startTime: review.booking.startTime,
        endTime: review.booking.endTime,
        category: review.booking.category
      } : null
    }));

    return {
      success: true,
      data: {
        reviews: formattedReviews,
        statistics: {
          totalReviews: total,
          averageRating: reviews.length > 0 
            ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length 
            : 0
        }
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Get student reviews service error:', error);
    return {
      success: false,
      message: 'Failed to get reviews',
      statusCode: 500,
      data: {
        reviews: [],
        statistics: {
          totalReviews: 0,
          averageRating: 0
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
 
const updateReview = async (studentUserId: string, reviewId: string, data: UpdateReviewInput) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student profile not found',
        statusCode: 404
      };
    }
 
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutorProfile: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    });

    if (!review) {
      return {
        success: false,
        message: 'Review not found',
        statusCode: 404
      };
    }

    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: 'You can only update your own reviews',
        statusCode: 403
      };
    }
 
    const booking = await prisma.booking.findUnique({
      where: { id: review.bookingId },
      include: {
        tutorProfile: {
          select: {
            id: true,
            userId: true,
            headline: true
          }
        },
        category: true
      }
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
        statusCode: 404
      };
    }
 
    const tutorUser = await prisma.user.findUnique({
      where: { id: booking.tutorProfile.userId },
      select: {
        name: true,
        image: true
      }
    });
 
    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment || null;

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData
    });
 
    const tutorReviews = await prisma.review.findMany({
      where: { tutorProfileId: review.tutorProfileId }
    });

    const averageRating = tutorReviews.reduce((sum, rev) => sum + rev.rating, 0) / tutorReviews.length;

    await prisma.tutorProfile.update({
      where: { id: review.tutorProfileId },
      data: {
        rating: averageRating
      }
    });

    return {
      success: true,
      message: 'Review updated successfully',
      data: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        isVerified: updatedReview.isVerified,
        createdAt: updatedReview.createdAt,
        booking: {
          id: booking.id,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          tutor: {
            id: booking.tutorProfile.id,
            headline: booking.tutorProfile.headline,
            user: tutorUser
          },
          category: booking.category
        }
      }
    };
  } catch (error: any) { 
    return {
      success: false,
      message: 'Failed to update review',
      statusCode: 500
    };
  }
};
 
const deleteReview = async (studentUserId: string, reviewId: string) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student profile not found',
        statusCode: 404
      };
    }
 
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutorProfile: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    });

    if (!review) {
      return {
        success: false,
        message: 'Review not found',
        statusCode: 404
      };
    }

    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: 'You can only delete your own reviews',
        statusCode: 403
      };
    } 
    await prisma.review.delete({
      where: { id: reviewId }
    });
 
    const tutorReviews = await prisma.review.findMany({
      where: { tutorProfileId: review.tutorProfileId }
    });

    const averageRating = tutorReviews.length > 0 
      ? tutorReviews.reduce((sum, rev) => sum + rev.rating, 0) / tutorReviews.length 
      : 0;

    await prisma.tutorProfile.update({
      where: { id: review.tutorProfileId },
      data: {
        rating: averageRating,
        totalReviews: tutorReviews.length
      }
    });

    return {
      success: true,
      message: 'Review deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete review service error:', error);
    return {
      success: false,
      message: 'Failed to delete review',
      statusCode: 500
    };
  }
};
 
const getReviewById = async (studentUserId: string, reviewId: string) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student profile not found',
        statusCode: 404
      };
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutorProfile: {
          select: {
            id: true,
            userId: true,
            headline: true,
            hourlyRate: true,
            rating: true
          }
        },
        booking: {
          include: {
            category: true
          }
        }
      }
    });

    if (!review) {
      return {
        success: false,
        message: 'Review not found',
        statusCode: 404
      };
    }

    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: 'You can only view your own reviews',
        statusCode: 403
      };
    }
 
    const tutorUser = await prisma.user.findUnique({
      where: { id: review.tutorProfile.userId },
      select: {
        name: true,
        image: true,
        email: true
      }
    });

    return {
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        tutor: {
          id: review.tutorProfile.id,
          userId: review.tutorProfile.userId,
          headline: review.tutorProfile.headline,
          hourlyRate: review.tutorProfile.hourlyRate,
          rating: review.tutorProfile.rating,
          user: tutorUser
        },
        booking: review.booking ? {
          id: review.booking.id,
          bookingDate: review.booking.bookingDate,
          startTime: review.booking.startTime,
          endTime: review.booking.endTime,
          category: review.booking.category
        } : null
      }
    };
  } catch (error: any) { 
    return {
      success: false,
      message: 'Failed to get review',
      statusCode: 500
    };
  }
};
 
export const studentReviewService = {
  createReview,
  getStudentReviews,
  updateReview,
  deleteReview,
  getReviewById
};