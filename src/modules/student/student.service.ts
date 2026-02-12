import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface UpdateStudentProfileInput {
  grade?: string;
  subjects?: string[];
}

interface CreateBookingInput {
  tutorProfileId: string;
  availabilitySlotId: string;
  categoryId: string;
  notes?: string;
}

const createStudentProfile = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (user.role !== 'STUDENT') {
      return {
        success: false,
        message: 'Only students can create student profiles'
      };
    }

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return {
        success: false,
        message: 'Student profile already exists'
      };
    }

    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        grade: null,
        subjects: []
      }
    });

    return {
      success: true,
      message: 'Student profile created successfully',
      data: profile
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create student profile'
    };
  }
};

const getStudentProfile = async (userId: string) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        bookings: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            tutorProfile: {
              select: {
                headline: true,
                hourlyRate: true
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return {
        success: false,
        message: 'Student profile not found'
      };
    }

    return {
      success: true,
      data: profile
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to get student profile'
    };
  }
};

const updateStudentProfile = async (userId: string, data: UpdateStudentProfileInput) => {
  try {
    const updateData: any = {};
    
    if (data.grade !== undefined) {
      updateData.grade = data.grade;
    }
    
    if (data.subjects !== undefined) {
      updateData.subjects = data.subjects;
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'No data provided for update'
      };
    }

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: updateData
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: profile
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to update profile'
    };
  }
};

const createBooking = async (studentUserId: string, data: CreateBookingInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: studentUserId }
      });

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      const tutorProfile = await tx.tutorProfile.findUnique({
        where: { id: data.tutorProfileId }
      });

      if (!tutorProfile) {
        throw new Error('Tutor not found');
      }

      const availabilitySlot = await tx.availabilitySlot.findUnique({
        where: { id: data.availabilitySlotId }
      });

      if (!availabilitySlot) {
        throw new Error('Time slot not found');
      }

      if (availabilitySlot.isBooked) {
        throw new Error('This time slot is already booked');
      }

      if (availabilitySlot.tutorProfileId !== data.tutorProfileId) {
        throw new Error('Time slot does not belong to this tutor');
      }

      if (new Date(availabilitySlot.date) < new Date()) {
        throw new Error('Cannot book past time slots');
      }

      const category = await tx.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      const duration = Math.round(
        (availabilitySlot.endTime.getTime() - availabilitySlot.startTime.getTime()) / (1000 * 60)
      );
      
      const amount = tutorProfile.hourlyRate * (duration / 60);

      const bookingData: any = {
        studentUserId,
        tutorUserId: tutorProfile.userId,
        studentProfileId: studentProfile.id,
        tutorProfileId: data.tutorProfileId,
        categoryId: data.categoryId,
        availabilitySlotId: data.availabilitySlotId,
        bookingDate: availabilitySlot.date,
        startTime: availabilitySlot.startTime,
        endTime: availabilitySlot.endTime,
        duration,
        status: 'PENDING',
        amount,
        isPaid: false
      };

      if (data.notes !== undefined) {
        bookingData.notes = data.notes;
      }

      const booking = await tx.booking.create({
        data: bookingData
      });

      await tx.availabilitySlot.update({
        where: { id: data.availabilitySlotId },
        data: { isBooked: true }
      });

      const tutorUser = await tx.user.findUnique({
        where: { id: tutorProfile.userId },
        select: {
          name: true,
          email: true
        }
      });

      await tx.notification.create({
        data: {
          userId: tutorProfile.userId,
          title: 'New Booking Request',
          message: `You have a new booking request from a student`,
          type: 'BOOKING',
          relatedId: booking.id,
          relatedType: 'Booking'
        }
      });

      const bookingWithDetails = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          tutorProfile: {
            select: {
              headline: true,
              hourlyRate: true,
              rating: true
            }
          },
          category: {
            select: {
              name: true,
              description: true
            }
          },
          availabilitySlot: {
            select: {
              date: true,
              startTime: true,
              endTime: true
            }
          }
        }
      });

      const result = {
        ...bookingWithDetails,
        tutorUser
      };

      return {
        success: true,
        message: 'Booking created successfully. Waiting for tutor confirmation.',
        data: result
      };
    });
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create booking'
    };
  }
};

const getStudentBookings = async (
  studentUserId: string,
  filters?: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }
) => {
  try {
    const whereConditions: any = {
      studentUserId
    };

    if (filters?.status !== undefined) {
      whereConditions.status = filters.status;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      where: whereConditions,
      include: {
        tutorProfile: {
          select: {
            headline: true,
            hourlyRate: true,
            rating: true
          }
        },
        category: {
          select: {
            name: true,
            description: true
          }
        },
        availabilitySlot: {
          select: {
            date: true,
            startTime: true,
            endTime: true
          }
        },
        review: {
          select: {
            rating: true,
            comment: true
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
          tutorUser
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

const cancelBooking = async (studentUserId: string, bookingId: string) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          studentUserId
        }
      });

      if (!booking) {
        throw new Error('Booking not found or access denied');
      }

      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed booking');
      }

      const updateData: any = {
        status: 'CANCELLED'
      };

      if (booking.notes) {
        updateData.notes = `${booking.notes}\n[Cancelled by student]`;
      } else {
        updateData.notes = 'Cancelled by student';
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: updateData
      });

      if (booking.availabilitySlotId) {
        await tx.availabilitySlot.update({
          where: { id: booking.availabilitySlotId },
          data: { isBooked: false }
        });
      }

      await tx.notification.create({
        data: {
          userId: booking.tutorUserId,
          title: 'Booking Cancelled',
          message: 'A student has cancelled their booking.',
          type: 'BOOKING',
          relatedId: bookingId,
          relatedType: 'Booking'
        }
      });

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: updatedBooking
      };
    });
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to cancel booking'
    };
  }
};

export const studentService = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  createBooking,
  getStudentBookings,
  cancelBooking
};