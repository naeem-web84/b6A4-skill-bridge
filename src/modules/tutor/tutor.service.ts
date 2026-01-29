import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth.middleware";

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



 
export const tutorService = {
  createTutorProfile, 
};
