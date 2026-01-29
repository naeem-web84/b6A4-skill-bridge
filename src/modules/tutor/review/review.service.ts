// modules/tutor/reviews/review.service.ts
import { prisma } from "../../../lib/prisma";

/* ========== TYPES ========== */
interface GetTutorReviewsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  minRating?: number;
}

/* ========== GET TUTOR'S REVIEWS ========== */
const getTutorReviews = async (userId: string, filters?: GetTutorReviewsFilters) => {
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

    // Build where conditions
    const whereConditions: any = {
      tutorProfileId: tutorProfile.id
    };

    // Filter by minimum rating
    if (filters?.minRating && filters.minRating > 0) {
      whereConditions.rating = {
        gte: filters.minRating
      };
    }

    // Determine sort order
    let orderBy: any = {};
    switch (filters?.sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Get reviews with student and booking details
    const reviews = await prisma.review.findMany({
      where: whereConditions,
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true,
            subjects: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            startTime: true,
            endTime: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: orderBy,
      skip,
      take: limit
    });

    // Get student user info for each review
    const reviewsWithUserInfo = await Promise.all(
      reviews.map(async (review) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: review.studentUserId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });

        return {
          ...review,
          studentUser
        };
      })
    );

    // Format response data
    const formattedReviews = reviewsWithUserInfo.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isVerified: review.isVerified,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      student: {
        id: review.studentUser?.id,
        name: review.studentUser?.name,
        email: review.studentUser?.email,
        image: review.studentUser?.image,
        grade: review.studentProfile?.grade,
        subjects: review.studentProfile?.subjects
      },
      booking: review.booking ? {
        id: review.booking.id,
        bookingDate: review.booking.bookingDate,
        startTime: review.booking.startTime,
        endTime: review.booking.endTime,
        category: review.booking.category?.name
      } : null
    }));

    // Get total count for pagination
    const total = await prisma.review.count({
      where: whereConditions
    });

    // Calculate statistics
    const stats = await prisma.review.aggregate({
      where: { tutorProfileId: tutorProfile.id },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      },
      _sum: {
        rating: true
      }
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { tutorProfileId: tutorProfile.id },
      _count: {
        rating: true
      }
    });

    const distribution = Array(5).fill(0).map((_, index) => {
      const rating = 5 - index;
      const found = ratingDistribution.find(r => r.rating === rating);
      return {
        rating,
        count: found?._count.rating || 0,
        percentage: total > 0 ? Math.round((found?._count.rating || 0) / total * 100) : 0
      };
    });

    return {
      success: true,
      data: {
        reviews: formattedReviews,
        statistics: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.id,
          ratingDistribution: distribution
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
    console.error('Get tutor reviews error:', error);
    return {
      success: false,
      message: 'Failed to get tutor reviews',
      data: {
        reviews: [],
        statistics: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: []
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
export const reviewService = {
  getTutorReviews
};