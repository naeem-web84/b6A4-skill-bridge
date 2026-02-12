import { prisma } from "../../../lib/prisma";
import { UserRole } from "../../../middleware/auth.middleware";
 
interface CreateTutorProfileInput {
  headline: string;
  bio?: string;
  hourlyRate: number;
  experienceYears: number;
  education?: string;
  certifications?: string;
  categories?: Array<{
    categoryId: string;
    proficiencyLevel?: string;
  }>;
}
 
interface UpdateTutorProfileInput {
  headline?: string;
  bio?: string;
  hourlyRate?: number;
  experienceYears?: number;
  education?: string;
  certifications?: string;
  categories?: Array<{
    categoryId: string;
    proficiencyLevel?: string;
  }>;
}
 
const createTutorProfile = async (
  userId: string,
  data: CreateTutorProfileInput
) => {
  try {
    return await prisma.$transaction(async (tx) => { 
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === UserRole.TUTOR) {
        throw new Error("User is already a tutor");
      }
 
      const existingProfile = await tx.tutorProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new Error("Tutor profile already exists");
      }
 
      await tx.user.update({
        where: { id: userId },
        data: {
          role: UserRole.TUTOR,
        },
      }); 
      const tutorProfile = await tx.tutorProfile.create({
        data: {
          userId,
          headline: data.headline,
          bio: data.bio ?? "",
          hourlyRate: data.hourlyRate,
          experienceYears: data.experienceYears,
          education: data.education ?? "",
          certifications: data.certifications ?? "",
          rating: 0,
          totalReviews: 0,
          completedSessions: 0,
        },
      });
 
      if (data.categories?.length) {
        await tx.tutorCategory.createMany({
          data: data.categories.map((category) => ({
            tutorProfileId: tutorProfile.id,
            categoryId: category.categoryId,
            proficiencyLevel: category.proficiencyLevel ?? "Intermediate",
          })),
        });
      }
 
      const completeProfile = await tx.tutorProfile.findUnique({
        where: { id: tutorProfile.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Tutor profile created successfully",
        tutorProfile: completeProfile,
      };
    });
  } catch (error: any) {
    console.error("Create tutor profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to create tutor profile",
    };
  }
};
 
const getTutorProfileByUserId = async (userId: string) => {
  try {
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        categories: {
          include: { category: true },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
            date: { gte: new Date() },
          },
          orderBy: { date: "asc" },
        },
      },
    });

    return { success: true, profile };
  } catch (error) { 
    return {
      success: false,
      message: "Failed to get tutor profile",
    };
  }
};
 
const checkTutorEligibility = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { canBecome: false, message: "User not found" };
    }

    if (user.role === UserRole.TUTOR) {
      return { canBecome: false, message: "Already a tutor" };
    }

    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return { canBecome: false, message: "Tutor profile already exists" };
    }

    return { canBecome: true };
  } catch (error) { 
    return {
      canBecome: false,
      message: "Internal server error",
    };
  }
};
 
const getAvailableCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, categories };
  } catch (error) { 
    return {
      success: false,
      categories: [],
      message: "Failed to fetch categories",
    };
  }
};
 
const updateTutorProfile = async (
  userId: string,
  data: UpdateTutorProfileInput
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      
      const existingProfile = await tx.tutorProfile.findUnique({
        where: { userId },
        include: {
          categories: {
            include: { category: true }
          }
        }
      });

      if (!existingProfile) {
        throw new Error("Tutor profile not found");
      }
 
      const updateData: any = {};
      
      if (data.headline !== undefined) updateData.headline = data.headline;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
      if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
      if (data.education !== undefined) updateData.education = data.education;
      if (data.certifications !== undefined) updateData.certifications = data.certifications;
       
      const updatedProfile = await tx.tutorProfile.update({
        where: { userId },
        data: updateData,
        include: {
          categories: {
            include: { category: true }
          }
        }
      });
 
      if (data.categories !== undefined) { 
        await tx.tutorCategory.deleteMany({
          where: { tutorProfileId: existingProfile.id }
        });
 
        if (data.categories.length > 0) {
          await tx.tutorCategory.createMany({
            data: data.categories.map((category) => ({
              tutorProfileId: existingProfile.id,
              categoryId: category.categoryId,
              proficiencyLevel: category.proficiencyLevel ?? "Intermediate"
            }))
          });
 
          const profileWithCategories = await tx.tutorProfile.findUnique({
            where: { userId },
            include: {
              categories: {
                include: { category: true }
              }
            }
          });

          return {
            success: true,
            message: "Tutor profile updated successfully",
            tutorProfile: profileWithCategories
          };
        }
      }

      return {
        success: true,
        message: "Tutor profile updated successfully",
        tutorProfile: updatedProfile
      };
    });
  } catch (error: any) {
    console.error("Update tutor profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to update tutor profile"
    };
  }
};


 
export const tutorService = {
  createTutorProfile, 
  getTutorProfileByUserId,
  checkTutorEligibility,
  getAvailableCategories,
  updateTutorProfile,
  
};
