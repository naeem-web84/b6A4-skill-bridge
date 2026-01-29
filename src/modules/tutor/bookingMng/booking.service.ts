import { BookingStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma"; 
 
interface GetBookingsFilters {
  status?: BookingStatus;
  studentId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

interface UpdateBookingStatusInput {
  status: BookingStatus;
  notes?: string;
  meetingLink?: string;
}

 
const getTutorBookings = async (
  userId: string,
  filters?: GetBookingsFilters
) => {
  try {
     
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

     
    const whereConditions: any = {
      tutorProfileId: tutorProfile.id
    };

    if (filters?.status) {
      whereConditions.status = filters.status;
    }

    if (filters?.studentId) {
      whereConditions.studentUserId = filters.studentId;
    }

    if (filters?.startDate && filters?.endDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    } else if (filters?.startDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate
      };
    } else if (filters?.endDate) {
      whereConditions.bookingDate = {
        lte: filters.endDate
      };
    }

     
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    
    const bookings = await prisma.booking.findMany({
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
        category: {
          select: {
            id: true,
            name: true,
            description: true
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
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      },
      skip,
      take: limit
    });

     
    const bookingsWithUserInfo = await Promise.all(
      bookings.map(async (booking) => {
         
        const user = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });

        return {
          ...booking,
          studentUser: user  
        };
      })
    );

     
    const total = await prisma.booking.count({
      where: whereConditions
    });

    return {
      success: true,
      data: bookingsWithUserInfo,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Get tutor bookings error:', error);
    return {
      success: false,
      message: 'Failed to get bookings',
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
};

 
const getBookingById = async (
  userId: string,
  bookingId: string
) => {
  try {
    
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

     
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        tutorProfileId: tutorProfile.id
      },
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true,
            subjects: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        availabilitySlot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            isRecurring: true,
            recurringPattern: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found or access denied');
    }

     
    const user = await prisma.user.findUnique({
      where: { id: booking.studentUserId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return {
      success: true,
      data: {
        ...booking,
        studentUser: user  
      }
    };
  } catch (error: any) {
    console.error('Get booking by ID error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get booking details'
    };
  }
};

/* Update Booking Status */
const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  data: UpdateBookingStatusInput
) => {
  try {
     
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

     
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        tutorProfileId: tutorProfile.id
      }
    });

    if (!existingBooking) {
      throw new Error('Booking not found or access denied');
    }

     
    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      COMPLETED: [],
      CANCELLED: [],
      RESCHEDULED: ['CONFIRMED', 'CANCELLED']
    };

    const allowedStatuses = allowedTransitions[existingBooking.status];
    if (!allowedStatuses.includes(data.status)) {
      throw new Error(`Cannot change status from ${existingBooking.status} to ${data.status}`);
    }

     
    const updateData: any = {
      status: data.status
    };

     
    if (data.meetingLink && data.status === 'CONFIRMED') {
      updateData.meetingLink = data.meetingLink;
    }

     
    if (data.notes) {
      updateData.notes = data.notes;
    }

     
    if (data.status === 'CANCELLED') {
       
      if (existingBooking.availabilitySlotId) {
        await prisma.availabilitySlot.update({
          where: { id: existingBooking.availabilitySlotId },
          data: { isBooked: false }
        });
      }
    }

    if (data.status === 'COMPLETED') {
       
      await prisma.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: {
          completedSessions: {
            increment: 1
          }
        }
      });
    }

     
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

     
    const studentUser = await prisma.user.findUnique({
      where: { id: existingBooking.studentUserId },
      select: {
        name: true,
        email: true
      }
    });

     
    if (data.status !== existingBooking.status) {
      await prisma.notification.create({
        data: {
          userId: existingBooking.studentUserId,
          title: 'Booking Status Updated',
          message: `Your booking status has been changed to ${data.status} by the tutor.`,
          type: 'BOOKING',
          relatedId: bookingId,
          relatedType: 'Booking'
        }
      });
    }

    return {
      success: true,
      message: `Booking status updated to ${data.status} successfully`,
      data: {
        ...updatedBooking,
        studentUser  
      }
    };
  } catch (error: any) {
    console.error('Update booking status error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update booking status'
    };
  }
};

/* Get Booking Statistics */
const getBookingStats = async (userId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalEarnings
    ] = await Promise.all([
      
      prisma.booking.count({
        where: { tutorProfileId: tutorProfile.id }
      }),
       
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'PENDING'
        }
      }),
       
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'CONFIRMED'
        }
      }),
       
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'COMPLETED'
        }
      }),
       
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'CANCELLED'
        }
      }),
      
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'CONFIRMED',
          bookingDate: {
            gte: new Date()
          }
        }
      }),
       
      prisma.booking.aggregate({
        where: {
          tutorProfileId: tutorProfile.id,
          status: 'COMPLETED',
          isPaid: true
        },
        _sum: {
          amount: true
        }
      })
    ]);

    return {
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        upcomingBookings,
        totalEarnings: totalEarnings._sum.amount || 0,
        completionRate: totalBookings > 0 
          ? Math.round((completedBookings / totalBookings) * 100) 
          : 0
      }
    };
  } catch (error: any) {
    console.error('Get booking stats error:', error);
    return {
      success: false,
      message: 'Failed to get booking statistics'
    };
  }
};

/* Export */
export const bookingService = {
  getTutorBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats
};