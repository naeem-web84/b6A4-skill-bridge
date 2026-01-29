import { prisma } from "../../../lib/prisma";
import { UserRole } from "../../../middleware/auth.middleware";

/* Types */
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

/* Create Tutor Profile */
const createTutorProfile = async (
  userId: string,
  data: CreateTutorProfileInput
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      /* 1. Check user */
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === UserRole.TUTOR) {
        throw new Error("User is already a tutor");
      }

      /* 2. Check existing tutor profile */
      const existingProfile = await tx.tutorProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new Error("Tutor profile already exists");
      }

      /* 3. Update user role */
      await tx.user.update({
        where: { id: userId },
        data: {
          role: UserRole.TUTOR,
        },
      });

      /* 4. Create tutor profile */
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

      /* 5. Attach categories (optional) */
      if (data.categories?.length) {
        await tx.tutorCategory.createMany({
          data: data.categories.map((category) => ({
            tutorProfileId: tutorProfile.id,
            categoryId: category.categoryId,
            proficiencyLevel: category.proficiencyLevel ?? "Intermediate",
          })),
        });
      }

      /* 6. Return full profile */
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

/*  Get Tutor Profile by User ID */
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
    console.error("Get tutor profile error:", error);
    return {
      success: false,
      message: "Failed to get tutor profile",
    };
  }
};

/*  Check Tutor Eligibility  */
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
    console.error("Check eligibility error:", error);
    return {
      canBecome: false,
      message: "Internal server error",
    };
  }
};

/*   Get All Categories */
const getAvailableCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, categories };
  } catch (error) {
    console.error("Fetch categories error:", error);
    return {
      success: false,
      categories: [],
      message: "Failed to fetch categories",
    };
  }
};

 
export const tutorService = {
  createTutorProfile, 
  getTutorProfileByUserId,
  checkTutorEligibility,
  getAvailableCategories,
  
};
