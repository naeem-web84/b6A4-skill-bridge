// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n  RESCHEDULED\n}\n\nenum NotificationType {\n  BOOKING\n  REVIEW\n  PAYMENT\n  SYSTEM\n  REMINDER\n}\n\nmodel Category {\n  id              String          @id @default(uuid())\n  name            String          @unique\n  description     String?\n  createdAt       DateTime        @default(now())\n  updatedAt       DateTime        @updatedAt\n  tutorCategories TutorCategory[]\n  bookings        Booking[]\n\n  @@map("categories")\n}\n\nmodel StudentProfile {\n  id        String    @id @default(uuid())\n  userId    String    @unique\n  grade     String?\n  subjects  String[]\n  bookings  Booking[] @relation("StudentBookings")\n  reviews   Review[]  @relation("StudentReviews")\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  @@map("student_profiles")\n}\n\nmodel TutorProfile {\n  id                String             @id @default(uuid())\n  userId            String             @unique\n  headline          String\n  bio               String?\n  hourlyRate        Float\n  experienceYears   Int                @default(0)\n  education         String?\n  certifications    String?\n  rating            Float              @default(0)\n  totalReviews      Int                @default(0)\n  completedSessions Int                @default(0)\n  categories        TutorCategory[]\n  availabilitySlots AvailabilitySlot[]\n  bookings          Booking[]          @relation("TutorBookings")\n  reviews           Review[]           @relation("TutorReviews")\n  createdAt         DateTime           @default(now())\n  updatedAt         DateTime           @updatedAt\n\n  @@map("tutor_profiles")\n}\n\nmodel TutorCategory {\n  id               String       @id @default(uuid())\n  tutorProfileId   String\n  categoryId       String\n  proficiencyLevel String?\n  tutorProfile     TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  category         Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  createdAt        DateTime     @default(now())\n\n  @@unique([tutorProfileId, categoryId])\n  @@map("tutor_categories")\n}\n\nmodel AvailabilitySlot {\n  id               String       @id @default(uuid())\n  tutorProfileId   String\n  tutorProfile     TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  date             DateTime\n  startTime        DateTime\n  endTime          DateTime\n  isRecurring      Boolean      @default(false)\n  recurringPattern String?\n  validFrom        DateTime?\n  validUntil       DateTime?\n  isBooked         Boolean      @default(false)\n  booking          Booking?\n  createdAt        DateTime     @default(now())\n  updatedAt        DateTime     @updatedAt\n\n  @@map("availability_slots")\n}\n\nmodel Booking {\n  id                 String            @id @default(uuid())\n  studentUserId      String\n  tutorUserId        String\n  studentProfileId   String\n  tutorProfileId     String\n  categoryId         String\n  availabilitySlotId String?           @unique\n  studentProfile     StudentProfile    @relation("StudentBookings", fields: [studentProfileId], references: [id], onDelete: Cascade)\n  tutorProfile       TutorProfile      @relation("TutorBookings", fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  category           Category          @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  availabilitySlot   AvailabilitySlot? @relation(fields: [availabilitySlotId], references: [id])\n  bookingDate        DateTime\n  startTime          DateTime\n  endTime            DateTime\n  duration           Int\n  status             BookingStatus     @default(PENDING)\n  amount             Float\n  paymentId          String?\n  isPaid             Boolean           @default(false)\n  meetingLink        String?\n  notes              String?\n  review             Review?           @relation("BookingReview")\n  createdAt          DateTime          @default(now())\n  updatedAt          DateTime          @updatedAt\n\n  @@map("bookings")\n}\n\nmodel Review {\n  id               String         @id @default(uuid())\n  studentUserId    String\n  studentProfileId String\n  tutorProfileId   String\n  bookingId        String         @unique\n  studentProfile   StudentProfile @relation("StudentReviews", fields: [studentProfileId], references: [id], onDelete: Cascade)\n  tutorProfile     TutorProfile   @relation("TutorReviews", fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  booking          Booking        @relation("BookingReview", fields: [bookingId], references: [id], onDelete: Cascade)\n  rating           Int            @default(5)\n  comment          String?\n  isVerified       Boolean        @default(false)\n  createdAt        DateTime       @default(now())\n  updatedAt        DateTime       @updatedAt\n\n  @@unique([studentProfileId, bookingId])\n  @@map("reviews")\n}\n\nmodel Notification {\n  id          String           @id @default(uuid())\n  userId      String\n  title       String\n  message     String?\n  type        NotificationType\n  relatedId   String?\n  relatedType String?\n  isRead      Boolean          @default(false)\n  isDeleted   Boolean          @default(false)\n  createdAt   DateTime         @default(now())\n  readAt      DateTime?\n\n  @@index([userId, isRead])\n  @@map("notifications")\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n  role          String    @default("STUDENT")\n  status        String?   @default("Active")\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"CategoryToTutorCategory"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCategory"}],"dbName":"categories"},"StudentProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"String"},{"name":"subjects","kind":"scalar","type":"String"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"StudentReviews"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"student_profiles"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"headline","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experienceYears","kind":"scalar","type":"Int"},{"name":"education","kind":"scalar","type":"String"},{"name":"certifications","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"completedSessions","kind":"scalar","type":"Int"},{"name":"categories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"availabilitySlots","kind":"object","type":"AvailabilitySlot","relationName":"AvailabilitySlotToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"TutorReviews"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"tutor_profiles"},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"proficiencyLevel","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"tutor_categories"},"AvailabilitySlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"AvailabilitySlotToTutorProfile"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"isRecurring","kind":"scalar","type":"Boolean"},{"name":"recurringPattern","kind":"scalar","type":"String"},{"name":"validFrom","kind":"scalar","type":"DateTime"},{"name":"validUntil","kind":"scalar","type":"DateTime"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilitySlotToBooking"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"availability_slots"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentUserId","kind":"scalar","type":"String"},{"name":"tutorUserId","kind":"scalar","type":"String"},{"name":"studentProfileId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"availabilitySlotId","kind":"scalar","type":"String"},{"name":"studentProfile","kind":"object","type":"StudentProfile","relationName":"StudentBookings"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorBookings"},{"name":"category","kind":"object","type":"Category","relationName":"BookingToCategory"},{"name":"availabilitySlot","kind":"object","type":"AvailabilitySlot","relationName":"AvailabilitySlotToBooking"},{"name":"bookingDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"duration","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"isPaid","kind":"scalar","type":"Boolean"},{"name":"meetingLink","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"review","kind":"object","type":"Review","relationName":"BookingReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"bookings"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentUserId","kind":"scalar","type":"String"},{"name":"studentProfileId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentProfile","kind":"object","type":"StudentProfile","relationName":"StudentReviews"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorReviews"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingReview"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"relatedId","kind":"scalar","type":"String"},{"name":"relatedType","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"readAt","kind":"scalar","type":"DateTime"}],"dbName":"notifications"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "STUDENT",
        input: true
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "Active"
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
      await transporter.sendMail({
        from: '"Skill Bridge" <skillbridge@team.com>',
        to: user.email,
        subject: "Please verify your email",
        html: `
          <h2>Verify Your Email</h2>
          <p>Hello ${user.name ?? "User"},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
        `
      });
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          emailVerified: true,
          name: profile.name
        };
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production"
  }
});

// src/app.ts
import cors from "cors";

// src/modules/tutor/profileManagement/tutor.router.ts
import { Router } from "express";

// src/middleware/auth.middleware.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["STUDENT"] = "STUDENT";
  UserRole2["TUTOR"] = "TUTOR";
  UserRole2["ADMIN"] = "ADMIN";
  return UserRole2;
})(UserRole || {});
var authenticate = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }
    const userRole = session.user.role || "STUDENT" /* STUDENT */;
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role configuration."
      });
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole,
      emailVerified: session.user.emailVerified
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication."
    });
  }
};
var authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated."
      });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`
      });
    }
    next();
  };
};
var auth2 = (...roles) => {
  return [
    authenticate,
    roles.length > 0 ? authorize(...roles) : (req, res, next) => next()
  ];
};
var auth_middleware_default = auth2;

// src/modules/tutor/profileManagement/tutor.service.ts
var createTutorProfile = async (userId, data) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role === "TUTOR" /* TUTOR */) {
        throw new Error("User is already a tutor");
      }
      const existingProfile = await tx.tutorProfile.findUnique({
        where: { userId }
      });
      if (existingProfile) {
        throw new Error("Tutor profile already exists");
      }
      await tx.user.update({
        where: { id: userId },
        data: {
          role: "TUTOR" /* TUTOR */
        }
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
          completedSessions: 0
        }
      });
      if (data.categories?.length) {
        await tx.tutorCategory.createMany({
          data: data.categories.map((category) => ({
            tutorProfileId: tutorProfile.id,
            categoryId: category.categoryId,
            proficiencyLevel: category.proficiencyLevel ?? "Intermediate"
          }))
        });
      }
      const completeProfile = await tx.tutorProfile.findUnique({
        where: { id: tutorProfile.id },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      });
      return {
        success: true,
        message: "Tutor profile created successfully",
        tutorProfile: completeProfile
      };
    });
  } catch (error) {
    console.error("Create tutor profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to create tutor profile"
    };
  }
};
var getTutorProfileByUserId = async (userId) => {
  try {
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        categories: {
          include: { category: true }
        },
        availabilitySlots: {
          where: {
            isBooked: false,
            date: { gte: /* @__PURE__ */ new Date() }
          },
          orderBy: { date: "asc" }
        }
      }
    });
    return { success: true, profile };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get tutor profile"
    };
  }
};
var checkTutorEligibility = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return { canBecome: false, message: "User not found" };
    }
    if (user.role === "TUTOR" /* TUTOR */) {
      return { canBecome: false, message: "Already a tutor" };
    }
    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (existingProfile) {
      return { canBecome: false, message: "Tutor profile already exists" };
    }
    return { canBecome: true };
  } catch (error) {
    return {
      canBecome: false,
      message: "Internal server error"
    };
  }
};
var getAvailableCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, categories };
  } catch (error) {
    return {
      success: false,
      categories: [],
      message: "Failed to fetch categories"
    };
  }
};
var updateTutorProfile = async (userId, data) => {
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
      const updateData = {};
      if (data.headline !== void 0) updateData.headline = data.headline;
      if (data.bio !== void 0) updateData.bio = data.bio;
      if (data.hourlyRate !== void 0) updateData.hourlyRate = data.hourlyRate;
      if (data.experienceYears !== void 0) updateData.experienceYears = data.experienceYears;
      if (data.education !== void 0) updateData.education = data.education;
      if (data.certifications !== void 0) updateData.certifications = data.certifications;
      const updatedProfile = await tx.tutorProfile.update({
        where: { userId },
        data: updateData,
        include: {
          categories: {
            include: { category: true }
          }
        }
      });
      if (data.categories !== void 0) {
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
  } catch (error) {
    console.error("Update tutor profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to update tutor profile"
    };
  }
};
var tutorService = {
  createTutorProfile,
  getTutorProfileByUserId,
  checkTutorEligibility,
  getAvailableCategories,
  updateTutorProfile
};

// src/modules/tutor/profileManagement/tutor.controller.ts
var createTutorProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      headline,
      bio,
      hourlyRate,
      experienceYears,
      education,
      certifications,
      categories
    } = req.body;
    if (!headline || hourlyRate === void 0 || experienceYears === void 0) {
      return res.status(400).json({
        success: false,
        message: "Headline, hourlyRate, and experienceYears are required"
      });
    }
    const result = await tutorService.createTutorProfile(userId, {
      headline,
      bio,
      hourlyRate: Number(hourlyRate),
      experienceYears: Number(experienceYears),
      education,
      certifications,
      categories
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json({
      success: true,
      message: "Tutor profile created successfully",
      data: result.tutorProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getTutorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await tutorService.getTutorProfileByUserId(userId);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found"
      });
    }
    return res.status(200).json({
      success: true,
      data: result.profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var checkEligibility = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await tutorService.checkTutorEligibility(userId);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getAvailableCategories2 = async (req, res) => {
  try {
    const result = await tutorService.getAvailableCategories();
    if (!result.success) {
      return res.status(500).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.categories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var updateTutorProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      headline,
      bio,
      hourlyRate,
      experienceYears,
      education,
      certifications,
      categories
    } = req.body;
    const updateData = {};
    if (headline !== void 0) updateData.headline = headline;
    if (bio !== void 0) updateData.bio = bio;
    if (hourlyRate !== void 0) updateData.hourlyRate = Number(hourlyRate);
    if (experienceYears !== void 0) updateData.experienceYears = Number(experienceYears);
    if (education !== void 0) updateData.education = education;
    if (certifications !== void 0) updateData.certifications = certifications;
    if (categories !== void 0) updateData.categories = categories;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }
    const result = await tutorService.updateTutorProfile(userId, updateData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: result.tutorProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var tutorController = {
  createTutorProfile: createTutorProfile2,
  getTutorProfile,
  checkEligibility,
  getAvailableCategories: getAvailableCategories2,
  updateTutorProfile: updateTutorProfile2
};

// src/modules/tutor/profileManagement/tutor.router.ts
var router = Router();
router.post("/create-profile", auth_middleware_default("STUDENT" /* STUDENT */), tutorController.createTutorProfile);
router.get("/profile", auth_middleware_default("TUTOR" /* TUTOR */), tutorController.getTutorProfile);
router.get("/check-eligibility", auth_middleware_default("STUDENT" /* STUDENT */), tutorController.checkEligibility);
router.get("/categories", auth_middleware_default(), tutorController.getAvailableCategories);
router.put("/profile", auth_middleware_default("TUTOR" /* TUTOR */), tutorController.updateTutorProfile);
var tutorRouter = router;

// src/modules/tutor/availabiltyManagement/management.router.ts
import { Router as Router2 } from "express";

// src/modules/tutor/availabiltyManagement/management.service.ts
var createAvailabilitySlot = async (userId, data) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const overlappingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        date: data.date,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } }
            ]
          }
        ]
      }
    });
    if (overlappingSlot) {
      throw new Error("Time slot overlaps with existing availability");
    }
    const duration = Math.round(
      (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1e3 * 60)
    );
    if (duration <= 0) {
      throw new Error("End time must be after start time");
    }
    const availabilitySlot = await prisma.availabilitySlot.create({
      data: {
        tutorProfileId: tutorProfile.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? false,
        recurringPattern: data.recurringPattern ?? null,
        validFrom: data.validFrom ?? null,
        validUntil: data.validUntil ?? null,
        isBooked: false
      }
    });
    return {
      success: true,
      message: "Availability slot created successfully",
      availabilitySlot
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create availability slot"
    };
  }
};
var getTutorAvailability = async (userId, filters) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const whereConditions = {
      tutorProfileId: tutorProfile.id
    };
    if (filters?.date) {
      whereConditions.date = filters.date;
    }
    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }
    if (filters?.isBooked !== void 0) {
      whereConditions.isBooked = filters.isBooked;
    }
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: whereConditions,
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    });
    return {
      success: true,
      availabilitySlots
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get availability slots",
      availabilitySlots: []
    };
  }
};
var getAvailabilitySlotById = async (userId, slotId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const availabilitySlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id
      }
    });
    if (!availabilitySlot) {
      throw new Error("Availability slot not found or access denied");
    }
    return {
      success: true,
      availabilitySlot
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to get availability slot"
    };
  }
};
var updateAvailabilitySlot = async (userId, slotId, data) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const existingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id,
        isBooked: false
      }
    });
    if (!existingSlot) {
      throw new Error("Availability slot not found, booked, or access denied");
    }
    if (data.startTime || data.endTime || data.date) {
      const checkDate = data.date || existingSlot.date;
      const checkStartTime = data.startTime || existingSlot.startTime;
      const checkEndTime = data.endTime || existingSlot.endTime;
      const overlappingSlot = await prisma.availabilitySlot.findFirst({
        where: {
          tutorProfileId: tutorProfile.id,
          id: { not: slotId },
          date: checkDate,
          OR: [
            {
              AND: [
                { startTime: { lte: checkStartTime } },
                { endTime: { gt: checkStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: checkEndTime } },
                { endTime: { gte: checkEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: checkStartTime } },
                { endTime: { lte: checkEndTime } }
              ]
            }
          ]
        }
      });
      if (overlappingSlot) {
        throw new Error("Updated time slot overlaps with existing availability");
      }
    }
    const updateData = {};
    if (data.date !== void 0) updateData.date = data.date;
    if (data.startTime !== void 0) updateData.startTime = data.startTime;
    if (data.endTime !== void 0) updateData.endTime = data.endTime;
    if (data.isBooked !== void 0) updateData.isBooked = data.isBooked;
    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: updateData
    });
    return {
      success: true,
      message: "Availability slot updated successfully",
      availabilitySlot: updatedSlot
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update availability slot"
    };
  }
};
var deleteAvailabilitySlot = async (userId, slotId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const existingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        id: slotId,
        tutorProfileId: tutorProfile.id,
        isBooked: false
      }
    });
    if (!existingSlot) {
      throw new Error("Availability slot not found, booked, or access denied");
    }
    await prisma.availabilitySlot.delete({
      where: { id: slotId }
    });
    return {
      success: true,
      message: "Availability slot deleted successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to delete availability slot"
    };
  }
};
var availabilityService = {
  createAvailabilitySlot,
  getTutorAvailability,
  getAvailabilitySlotById,
  updateAvailabilitySlot,
  deleteAvailabilitySlot
};

// src/modules/tutor/availabiltyManagement/management.controller.ts
var createAvailabilitySlot2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      date,
      startTime,
      endTime,
      isRecurring,
      recurringPattern,
      validFrom,
      validUntil
    } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Date, startTime, and endTime are required"
      });
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const slotDate = new Date(date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(slotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }
    const input = {
      date: slotDate,
      startTime: startDate,
      endTime: endDate
    };
    if (isRecurring !== void 0) {
      input.isRecurring = Boolean(isRecurring);
    }
    if (recurringPattern !== void 0) {
      input.recurringPattern = recurringPattern;
    }
    if (validFrom !== void 0) {
      const validFromDate = new Date(validFrom);
      if (!isNaN(validFromDate.getTime())) {
        input.validFrom = validFromDate;
      }
    }
    if (validUntil !== void 0) {
      const validUntilDate = new Date(validUntil);
      if (!isNaN(validUntilDate.getTime())) {
        input.validUntil = validUntilDate;
      }
    }
    const result = await availabilityService.createAvailabilitySlot(userId, input);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.availabilitySlot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getTutorAvailability2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { date, startDate, endDate, isBooked } = req.query;
    const filters = {};
    if (date) filters.date = new Date(date);
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (isBooked !== void 0) filters.isBooked = isBooked === "true";
    const result = await availabilityService.getTutorAvailability(userId, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.availabilitySlots
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getAvailabilitySlot = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const extractSlotId = (idParam) => {
      if (!idParam) return null;
      if (Array.isArray(idParam)) {
        return idParam[0] || null;
      }
      return idParam;
    };
    const slotId = extractSlotId(req.params.Id);
    if (!slotId || slotId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required"
      });
    }
    const result = await availabilityService.getAvailabilitySlotById(userId, slotId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.availabilitySlot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var updateAvailabilitySlot2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { slotId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required"
      });
    }
    const {
      date,
      startTime,
      endTime,
      isBooked
    } = req.body;
    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (isBooked !== void 0) updateData.isBooked = isBooked;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }
    const result = await availabilityService.updateAvailabilitySlot(
      userId,
      slotId,
      updateData
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.availabilitySlot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var deleteAvailabilitySlot2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { slotId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required"
      });
    }
    const result = await availabilityService.deleteAvailabilitySlot(userId, slotId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var availabilityController = {
  createAvailabilitySlot: createAvailabilitySlot2,
  getTutorAvailability: getTutorAvailability2,
  getAvailabilitySlot,
  updateAvailabilitySlot: updateAvailabilitySlot2,
  deleteAvailabilitySlot: deleteAvailabilitySlot2
};

// src/modules/tutor/availabiltyManagement/management.router.ts
var router2 = Router2();
router2.post(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  availabilityController.createAvailabilitySlot
);
router2.get(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  availabilityController.getTutorAvailability
);
router2.get(
  "/:Id",
  auth_middleware_default("TUTOR" /* TUTOR */),
  availabilityController.getAvailabilitySlot
);
router2.put(
  "/:slotId",
  auth_middleware_default("TUTOR" /* TUTOR */),
  availabilityController.updateAvailabilitySlot
);
router2.delete(
  "/:slotId",
  auth_middleware_default("TUTOR" /* TUTOR */),
  availabilityController.deleteAvailabilitySlot
);
var availabilityRouter = router2;

// src/modules/student/student.router.ts
import { Router as Router3 } from "express";

// src/modules/student/student.service.ts
var createStudentProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    if (user.role !== "STUDENT") {
      return {
        success: false,
        message: "Only students can create student profiles"
      };
    }
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    if (existingProfile) {
      return {
        success: false,
        message: "Student profile already exists"
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
      message: "Student profile created successfully",
      data: profile
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create student profile"
    };
  }
};
var getStudentProfile = async (userId) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        bookings: {
          take: 5,
          orderBy: {
            createdAt: "desc"
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
        message: "Student profile not found"
      };
    }
    return {
      success: true,
      data: profile
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get student profile"
    };
  }
};
var updateStudentProfile = async (userId, data) => {
  try {
    const updateData = {};
    if (data.grade !== void 0) {
      updateData.grade = data.grade;
    }
    if (data.subjects !== void 0) {
      updateData.subjects = data.subjects;
    }
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "No data provided for update"
      };
    }
    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: updateData
    });
    return {
      success: true,
      message: "Profile updated successfully",
      data: profile
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update profile"
    };
  }
};
var createBooking = async (studentUserId, data) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: studentUserId }
      });
      if (!studentProfile) {
        throw new Error("Student profile not found");
      }
      const tutorProfile = await tx.tutorProfile.findUnique({
        where: { id: data.tutorProfileId }
      });
      if (!tutorProfile) {
        throw new Error("Tutor not found");
      }
      const availabilitySlot = await tx.availabilitySlot.findUnique({
        where: { id: data.availabilitySlotId }
      });
      if (!availabilitySlot) {
        throw new Error("Time slot not found");
      }
      if (availabilitySlot.isBooked) {
        throw new Error("This time slot is already booked");
      }
      if (availabilitySlot.tutorProfileId !== data.tutorProfileId) {
        throw new Error("Time slot does not belong to this tutor");
      }
      if (new Date(availabilitySlot.date) < /* @__PURE__ */ new Date()) {
        throw new Error("Cannot book past time slots");
      }
      const category = await tx.category.findUnique({
        where: { id: data.categoryId }
      });
      if (!category) {
        throw new Error("Category not found");
      }
      const duration = Math.round(
        (availabilitySlot.endTime.getTime() - availabilitySlot.startTime.getTime()) / (1e3 * 60)
      );
      const amount = tutorProfile.hourlyRate * (duration / 60);
      const bookingData = {
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
        status: "PENDING",
        amount,
        isPaid: false
      };
      if (data.notes !== void 0) {
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
          title: "New Booking Request",
          message: `You have a new booking request from a student`,
          type: "BOOKING",
          relatedId: booking.id,
          relatedType: "Booking"
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
        message: "Booking created successfully. Waiting for tutor confirmation.",
        data: result
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create booking"
    };
  }
};
var getStudentBookings = async (studentUserId, filters) => {
  try {
    const whereConditions = {
      studentUserId
    };
    if (filters?.status !== void 0) {
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
        bookingDate: "desc"
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to get bookings",
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
var cancelBooking = async (studentUserId, bookingId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          studentUserId
        }
      });
      if (!booking) {
        throw new Error("Booking not found or access denied");
      }
      if (booking.status === "CANCELLED") {
        throw new Error("Booking is already cancelled");
      }
      if (booking.status === "COMPLETED") {
        throw new Error("Cannot cancel completed booking");
      }
      const updateData = {
        status: "CANCELLED"
      };
      if (booking.notes) {
        updateData.notes = `${booking.notes}
[Cancelled by student]`;
      } else {
        updateData.notes = "Cancelled by student";
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
          title: "Booking Cancelled",
          message: "A student has cancelled their booking.",
          type: "BOOKING",
          relatedId: bookingId,
          relatedType: "Booking"
        }
      });
      return {
        success: true,
        message: "Booking cancelled successfully",
        data: updatedBooking
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to cancel booking"
    };
  }
};
var studentService = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  createBooking,
  getStudentBookings,
  cancelBooking
};

// src/modules/student/student.controller.ts
var createStudentProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await studentService.createStudentProfile(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(201).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getStudentProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await studentService.getStudentProfile(userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var updateStudentProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { grade, subjects } = req.body;
    const result = await studentService.updateStudentProfile(userId, {
      grade,
      subjects
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var createBooking2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      tutorProfileId,
      availabilitySlotId,
      categoryId,
      notes
    } = req.body;
    if (!tutorProfileId || !availabilitySlotId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "tutorProfileId, availabilitySlotId, and categoryId are required"
      });
    }
    const result = await studentService.createBooking(studentUserId, {
      tutorProfileId,
      availabilitySlotId,
      categoryId,
      notes
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(201).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getStudentBookings2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      status,
      page = "1",
      limit = "10"
    } = req.query;
    const filters = {};
    if (status) {
      if (!Object.values(BookingStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status"
        });
      }
      filters.status = status;
    }
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    const result = await studentService.getStudentBookings(studentUserId, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data,
      pagination: successResult.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var cancelBooking2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }
    const result = await studentService.cancelBooking(studentUserId, bookingId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var studentController = {
  createStudentProfile: createStudentProfile2,
  getStudentProfile: getStudentProfile2,
  updateStudentProfile: updateStudentProfile2,
  createBooking: createBooking2,
  getStudentBookings: getStudentBookings2,
  cancelBooking: cancelBooking2
};

// src/modules/student/student.router.ts
var router3 = Router3();
router3.post(
  "/profile",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.createStudentProfile
);
router3.get(
  "/profile",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.getStudentProfile
);
router3.put(
  "/profile",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.updateStudentProfile
);
router3.post(
  "/bookings",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.createBooking
);
router3.get(
  "/bookings",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.getStudentBookings
);
router3.delete(
  "/bookings/:bookingId",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentController.cancelBooking
);
var studentRouter = router3;

// src/modules/tutor/categoryMng/category.router.ts
import { Router as Router4 } from "express";

// src/modules/tutor/categoryMng/category.service.ts
var addTeachingCategory = async (userId, data) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      return {
        success: false,
        message: "Category not found"
      };
    }
    const existingTutorCategory = await prisma.tutorCategory.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        categoryId: data.categoryId
      }
    });
    if (existingTutorCategory) {
      return {
        success: false,
        message: "You already have this category added"
      };
    }
    const tutorCategory = await prisma.tutorCategory.create({
      data: {
        tutorProfileId: tutorProfile.id,
        categoryId: data.categoryId,
        proficiencyLevel: data.proficiencyLevel ?? null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
    return {
      success: true,
      message: "Category added successfully",
      data: tutorCategory
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to add teaching category"
    };
  }
};
var getTutorCategories = async (userId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const tutorCategories = await prisma.tutorCategory.findMany({
      where: {
        tutorProfileId: tutorProfile.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const categories = tutorCategories.map((tc) => ({
      id: tc.id,
      proficiencyLevel: tc.proficiencyLevel,
      addedAt: tc.createdAt,
      category: tc.category
    }));
    return {
      success: true,
      data: categories
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get tutor categories",
      data: []
    };
  }
};
var removeTeachingCategory = async (userId, categoryId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const tutorCategory = await prisma.tutorCategory.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        id: categoryId
      }
    });
    if (!tutorCategory) {
      return {
        success: false,
        message: "Category not found in your teaching categories"
      };
    }
    const existingBookings = await prisma.booking.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        categoryId: tutorCategory.categoryId,
        status: {
          notIn: ["CANCELLED", "COMPLETED"]
        }
      }
    });
    if (existingBookings) {
      return {
        success: false,
        message: "Cannot remove category with active or pending bookings"
      };
    }
    await prisma.tutorCategory.delete({
      where: { id: tutorCategory.id }
    });
    return {
      success: true,
      message: "Category removed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to remove teaching category"
    };
  }
};
var categoryService = {
  addTeachingCategory,
  getTutorCategories,
  removeTeachingCategory
};

// src/modules/tutor/categoryMng/category.controller.ts
var addTeachingCategory2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { categoryId, proficiencyLevel } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required"
      });
    }
    const result = await categoryService.addTeachingCategory(userId, {
      categoryId,
      proficiencyLevel
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(201).json({
      success: true,
      message: successResult.message,
      data: successResult.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getTutorCategories2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await categoryService.getTutorCategories(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error) {
    console.error("Controller error getting tutor categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var removeTeachingCategory2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { categoryId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!categoryId || typeof categoryId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }
    const result = await categoryService.removeTeachingCategory(userId, categoryId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      message: successResult.message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var categoryController = {
  addTeachingCategory: addTeachingCategory2,
  getTutorCategories: getTutorCategories2,
  removeTeachingCategory: removeTeachingCategory2
};

// src/modules/tutor/categoryMng/category.router.ts
var router4 = Router4();
router4.post(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  categoryController.addTeachingCategory
);
router4.get(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  categoryController.getTutorCategories
);
router4.delete(
  "/:categoryId",
  auth_middleware_default("TUTOR" /* TUTOR */),
  categoryController.removeTeachingCategory
);
var categoryRouter = router4;

// src/modules/tutor/dashboard/dash.router.ts
import { Router as Router5 } from "express";

// src/modules/tutor/dashboard/dash.service.ts
var getDateKey = (date) => {
  if (!date) return "no-date";
  return date.toISOString().split("T")[0] ?? "no-date";
};
var getDashboardStats = async (userId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const now = /* @__PURE__ */ new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const earningsResult = await prisma.booking.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        status: "COMPLETED",
        isPaid: true
      },
      _sum: {
        amount: true
      }
    });
    const todayEarningsResult = await prisma.booking.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        status: "COMPLETED",
        isPaid: true,
        bookingDate: {
          gte: startOfToday
        }
      },
      _sum: {
        amount: true
      }
    });
    const sessionStats = await prisma.booking.groupBy({
      by: ["status"],
      where: {
        tutorProfileId: tutorProfile.id
      },
      _count: {
        id: true
      }
    });
    const sessionsByStatus = {};
    sessionStats.forEach((stat) => {
      if (stat.status) {
        sessionsByStatus[stat.status] = stat._count.id;
      }
    });
    const upcomingSessions = await prisma.booking.count({
      where: {
        tutorProfileId: tutorProfile.id,
        status: "CONFIRMED",
        bookingDate: {
          gte: startOfToday
        }
      }
    });
    const pendingRequests = await prisma.booking.count({
      where: {
        tutorProfileId: tutorProfile.id,
        status: "PENDING"
      }
    });
    const recentReviews = await prisma.review.aggregate({
      where: {
        tutorProfileId: tutorProfile.id,
        createdAt: {
          gte: startOfMonth
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });
    const availableSlots = await prisma.availabilitySlot.count({
      where: {
        tutorProfileId: tutorProfile.id,
        isBooked: false,
        date: {
          gte: startOfToday
        }
      }
    });
    const uniqueStudents = await prisma.booking.groupBy({
      by: ["studentUserId"],
      where: {
        tutorProfileId: tutorProfile.id
      }
    });
    const fourWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    const weeklyEarnings = await prisma.booking.groupBy({
      by: ["bookingDate"],
      where: {
        tutorProfileId: tutorProfile.id,
        status: "COMPLETED",
        isPaid: true,
        bookingDate: {
          gte: fourWeeksAgo
        }
      },
      _sum: {
        amount: true
      }
    });
    const weeklyEarningsData = weeklyEarnings.map((item) => ({
      date: item.bookingDate,
      earnings: item._sum.amount || 0
    }));
    const totalSessions = Object.values(sessionsByStatus).reduce((a, b) => a + b, 0);
    const completedSessions = sessionsByStatus["COMPLETED"] || 0;
    const completionRate = totalSessions > 0 ? completedSessions / totalSessions * 100 : 0;
    const stats = {
      totalEarnings: earningsResult._sum.amount || 0,
      todayEarnings: todayEarningsResult._sum.amount || 0,
      averageSessionPrice: completedSessions > 0 ? (earningsResult._sum.amount || 0) / completedSessions : 0,
      totalSessions,
      completedSessions,
      upcomingSessions,
      pendingRequests,
      availableSlots,
      completionRate: Math.round(completionRate),
      sessionsByStatus: {
        completed: sessionsByStatus["COMPLETED"] || 0,
        confirmed: sessionsByStatus["CONFIRMED"] || 0,
        pending: sessionsByStatus["PENDING"] || 0,
        cancelled: sessionsByStatus["CANCELLED"] || 0,
        rescheduled: sessionsByStatus["RESCHEDULED"] || 0
      },
      averageRating: tutorProfile.rating,
      totalReviews: tutorProfile.totalReviews,
      recentReviews: recentReviews._count.id,
      recentAverageRating: recentReviews._avg.rating || 0,
      totalStudents: uniqueStudents.length,
      weeklyEarnings: weeklyEarningsData,
      hourlyRate: tutorProfile.hourlyRate,
      experienceYears: tutorProfile.experienceYears
    };
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get dashboard statistics",
      data: {
        totalEarnings: 0,
        todayEarnings: 0,
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        pendingRequests: 0,
        availableSlots: 0,
        completionRate: 0,
        sessionsByStatus: {
          completed: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          rescheduled: 0
        },
        averageRating: 0,
        totalReviews: 0,
        recentReviews: 0,
        recentAverageRating: 0,
        totalStudents: 0,
        weeklyEarnings: [],
        hourlyRate: 0,
        experienceYears: 0,
        averageSessionPrice: 0
      }
    };
  }
};
var getUpcomingSessions = async (userId, filters) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const now = /* @__PURE__ */ new Date();
    const days = filters?.days || 7;
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    const limit = filters?.limit || 10;
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        tutorProfileId: tutorProfile.id,
        status: "CONFIRMED",
        startTime: {
          gte: now,
          lte: endDate
        }
      },
      include: {
        studentProfile: {
          select: {
            id: true,
            userId: true,
            grade: true
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
            date: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        startTime: "asc"
      },
      take: limit
    });
    const bookingsWithUserInfo = await Promise.all(
      upcomingBookings.map(async (booking) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });
        const sessionTime = booking.startTime;
        const timeUntil = sessionTime.getTime() - now.getTime();
        const hoursUntil = Math.floor(timeUntil / (1e3 * 60 * 60));
        const minutesUntil = Math.floor(timeUntil % (1e3 * 60 * 60) / (1e3 * 60));
        let status = "upcoming";
        if (hoursUntil < 24) status = "tomorrow";
        if (hoursUntil < 2) status = "soon";
        if (hoursUntil < 0) status = "past";
        return {
          id: booking.id,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          amount: booking.amount,
          status: booking.status,
          notes: booking.notes,
          meetingLink: booking.meetingLink,
          timeUntil: {
            hours: hoursUntil,
            minutes: minutesUntil,
            totalMinutes: Math.floor(timeUntil / (1e3 * 60))
          },
          sessionStatus: status,
          student: {
            id: studentUser?.id,
            name: studentUser?.name,
            email: studentUser?.email,
            image: studentUser?.image,
            grade: booking.studentProfile?.grade
          },
          category: booking.category,
          availabilitySlot: booking.availabilitySlot
        };
      })
    );
    const sessionsByDate = {};
    bookingsWithUserInfo.forEach((booking) => {
      const dateKey = getDateKey(booking.bookingDate);
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(booking);
    });
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todaysSessions = bookingsWithUserInfo.filter((booking) => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck >= startOfToday && dateToCheck < endOfToday;
    });
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    const tomorrowsSessions = bookingsWithUserInfo.filter((booking) => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck >= startOfTomorrow && dateToCheck < endOfTomorrow;
    });
    const thisWeekSessions = bookingsWithUserInfo.filter((booking) => {
      const dateToCheck = booking.bookingDate || booking.startTime;
      return dateToCheck <= endDate;
    });
    return {
      success: true,
      data: {
        sessions: bookingsWithUserInfo,
        groupedByDate: sessionsByDate,
        todaysSessions,
        tomorrowsSessions,
        summary: {
          total: bookingsWithUserInfo.length,
          today: todaysSessions.length,
          tomorrow: tomorrowsSessions.length,
          thisWeek: thisWeekSessions.length
        }
      }
    };
  } catch (error) {
    console.error("Get upcoming sessions error:", error);
    return {
      success: false,
      message: "Failed to get upcoming sessions",
      data: {
        sessions: [],
        groupedByDate: {},
        todaysSessions: [],
        tomorrowsSessions: [],
        summary: {
          total: 0,
          today: 0,
          tomorrow: 0,
          thisWeek: 0
        }
      }
    };
  }
};
var dashboardService = {
  getDashboardStats,
  getUpcomingSessions
};

// src/modules/tutor/dashboard/dash.controller.ts
var getDashboardStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await dashboardService.getDashboardStats(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error) {
    console.error("Controller error getting dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getUpcomingSessions2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      days = "7",
      limit = "10"
    } = req.query;
    const filters = {};
    if (days) filters.days = parseInt(days);
    if (limit) filters.limit = parseInt(limit);
    const result = await dashboardService.getUpcomingSessions(userId, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data
    });
  } catch (error) {
    console.error("Controller error getting upcoming sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var dashboardController = {
  getDashboardStats: getDashboardStats2,
  getUpcomingSessions: getUpcomingSessions2
};

// src/modules/tutor/dashboard/dash.router.ts
var router5 = Router5();
router5.get(
  "/stats",
  auth_middleware_default("TUTOR" /* TUTOR */),
  dashboardController.getDashboardStats
);
router5.get(
  "/upcoming",
  auth_middleware_default("TUTOR" /* TUTOR */),
  dashboardController.getUpcomingSessions
);
var dashboardRouter = router5;

// src/modules/tutor/public/public.router.ts
import { Router as Router6 } from "express";

// src/modules/tutor/public/public.service.ts
var getDateKey2 = (date) => {
  if (!date) return "no-date";
  return date.toISOString().split("T")[0];
};
var browseTutors = async (filters) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minRating = 0,
      maxHourlyRate,
      experienceYears,
      sortBy = "rating",
      sortOrder = "desc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        {
          headline: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        }
      ];
    }
    if (category) {
      where.tutor_categories = {
        some: {
          categoryId: category
        }
      };
    }
    if (minRating) {
      where.rating = {
        gte: minRating
      };
    }
    if (maxHourlyRate) {
      where.hourlyRate = {
        lte: maxHourlyRate
      };
    }
    if (experienceYears) {
      where.experienceYears = {
        gte: experienceYears
      };
    }
    const orderBy = {};
    if (sortBy === "hourlyRate") {
      orderBy.hourlyRate = sortOrder;
    } else if (sortBy === "experienceYears") {
      orderBy.experienceYears = sortOrder;
    } else if (sortBy === "totalReviews") {
      orderBy.totalReviews = sortOrder;
    } else {
      orderBy.rating = sortOrder;
    }
    const tutors = await prisma.tutorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy
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
            image: true,
            createdAt: true
          }
        });
        const tutorCategories = await prisma.tutorCategory.findMany({
          where: { tutorProfileId: tutor.id },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        });
        const reviews = await prisma.review.findMany({
          where: { tutorProfileId: tutor.id },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          },
          take: 5,
          orderBy: {
            createdAt: "desc"
          }
        });
        return {
          id: tutor.id,
          userId: tutor.userId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          image: user?.image || null,
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
          categories: tutorCategories.map((tc) => tc.category),
          recentReviews: reviews
        };
      })
    );
    return {
      success: true,
      data: {
        tutors: tutorsWithUserInfo,
        pagination: {
          page,
          limit,
          total: totalTutors,
          totalPages: Math.ceil(totalTutors / limit),
          hasNextPage: page * limit < totalTutors,
          hasPrevPage: page > 1
        },
        filters: {
          search,
          category,
          minRating,
          maxHourlyRate,
          experienceYears,
          sortBy,
          sortOrder
        }
      }
    };
  } catch (error) {
    console.error("Browse tutors service error:", error);
    return {
      success: false,
      message: "Failed to browse tutors",
      data: null
    };
  }
};
var getTutorProfile2 = async (tutorId) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: {
        id: tutorId
      }
    });
    if (!tutor) {
      return {
        success: false,
        message: "Tutor not found",
        data: null
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: tutor.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true
      }
    });
    const tutorCategories = await prisma.tutorCategory.findMany({
      where: { tutorProfileId: tutor.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
    const reviews = await prisma.review.findMany({
      where: { tutorProfileId: tutor.id },
      orderBy: {
        createdAt: "desc"
      }
    });
    const reviewsWithStudentInfo = await Promise.all(
      reviews.map(async (review) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: review.studentUserId },
          select: {
            id: true,
            name: true,
            image: true
          }
        });
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: review.studentUserId },
          select: {
            grade: true
          }
        });
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          student: {
            id: studentUser?.id,
            name: studentUser?.name,
            image: studentUser?.image,
            grade: studentProfile?.grade
          }
        };
      })
    );
    const bookings = await prisma.booking.findMany({
      where: {
        tutorProfileId: tutorId,
        status: "COMPLETED"
      },
      select: {
        id: true,
        bookingDate: true,
        studentUserId: true
      },
      take: 50
    });
    const totalStudents = new Set(bookings.map((b) => b.studentUserId)).size;
    const totalSessions = bookings.length;
    const availableSlots = await prisma.availabilitySlot.count({
      where: {
        tutorProfileId: tutorId,
        isBooked: false,
        date: {
          gte: /* @__PURE__ */ new Date()
        }
      }
    });
    const formattedTutor = {
      id: tutor.id,
      userId: tutor.userId,
      name: user?.name || "Unknown",
      email: user?.email || "",
      image: user?.image || null,
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
      categories: tutorCategories.map((tc) => tc.category),
      reviews: reviewsWithStudentInfo,
      statistics: {
        totalStudents,
        totalSessions,
        availableSlots,
        completedSessions: tutor.completedSessions || 0
      }
    };
    return {
      success: true,
      data: formattedTutor
    };
  } catch (error) {
    console.error("Get tutor profile service error:", error);
    return {
      success: false,
      message: "Failed to get tutor profile",
      data: null
    };
  }
};
var getTutorAvailability3 = async (tutorId, filters) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: {
        id: tutorId
      }
    });
    if (!tutor) {
      return {
        success: false,
        message: "Tutor not found",
        data: null
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: tutor.userId },
      select: {
        name: true
      }
    });
    const now = /* @__PURE__ */ new Date();
    const startDate = filters.startDate || now;
    const endDate = filters.endDate || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        tutorProfileId: tutorId,
        isBooked: false,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    });
    const slotsByDate = {};
    availabilitySlots.forEach((slot) => {
      const dateKey = getDateKey2(slot.date);
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = [];
      }
      slotsByDate[dateKey].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring,
        recurringPattern: slot.recurringPattern
      });
    });
    const formattedDates = Object.keys(slotsByDate).map((date) => ({
      date,
      slots: slotsByDate[date]
    }));
    return {
      success: true,
      data: {
        tutorId,
        tutorName: user?.name || "Unknown",
        startDate,
        endDate,
        totalAvailableSlots: availabilitySlots.length,
        availability: formattedDates,
        slotsByDate
      }
    };
  } catch (error) {
    console.error("Get tutor availability service error:", error);
    return {
      success: false,
      message: "Failed to get tutor availability",
      data: null
    };
  }
};
var publicTutorService = {
  browseTutors,
  getTutorProfile: getTutorProfile2,
  getTutorAvailability: getTutorAvailability3
};

// src/modules/tutor/public/public.controller.ts
var browseTutors2 = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      minRating,
      maxHourlyRate,
      experienceYears,
      sortBy = "rating",
      sortOrder = "desc"
    } = req.query;
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (minRating) filters.minRating = parseFloat(minRating);
    if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate);
    if (experienceYears) filters.experienceYears = parseInt(experienceYears);
    const result = await publicTutorService.browseTutors(filters);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to browse tutors",
      data: null
    });
  }
};
var getTutorProfile3 = async (req, res) => {
  try {
    const tutorId = Array.isArray(req.params.tutorId) ? req.params.tutorId[0] : req.params.tutorId;
    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID is required"
      });
    }
    const result = await publicTutorService.getTutorProfile(tutorId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get tutor profile",
      data: null
    });
  }
};
var getTutorAvailability4 = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;
    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID is required"
      });
    }
    const filters = {};
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    const result = await publicTutorService.getTutorAvailability(tutorId, filters);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get tutor availability",
      data: null
    });
  }
};
var publicTutorController = {
  browseTutors: browseTutors2,
  getTutorProfile: getTutorProfile3,
  getTutorAvailability: getTutorAvailability4
};

// src/modules/tutor/public/public.router.ts
var router6 = Router6();
router6.get(
  "/",
  publicTutorController.browseTutors
);
router6.get(
  "/:tutorId",
  publicTutorController.getTutorProfile
);
router6.get(
  "/:tutorId/availability",
  publicTutorController.getTutorAvailability
);
var publicTutorRouter = router6;

// src/modules/tutor/review/review.router.ts
import { Router as Router7 } from "express";

// src/modules/tutor/review/review.service.ts
var getTutorReviews = async (userId, filters) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const whereConditions = {
      tutorProfileId: tutorProfile.id
    };
    if (filters?.minRating && filters.minRating > 0) {
      whereConditions.rating = {
        gte: filters.minRating
      };
    }
    let orderBy = {};
    switch (filters?.sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;
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
      orderBy,
      skip,
      take: limit
    });
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
    const formattedReviews = reviewsWithUserInfo.map((review) => ({
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
    const total = await prisma.review.count({
      where: whereConditions
    });
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
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { tutorProfileId: tutorProfile.id },
      _count: {
        rating: true
      }
    });
    const distribution = Array(5).fill(0).map((_, index) => {
      const rating = 5 - index;
      const found = ratingDistribution.find((r) => r.rating === rating);
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
  } catch (error) {
    console.error("Get tutor reviews error:", error);
    return {
      success: false,
      message: "Failed to get tutor reviews",
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
var reviewService = {
  getTutorReviews
};

// src/modules/tutor/review/review.controller.ts
var getTutorReviews2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      page = "1",
      limit = "10",
      sortBy = "newest",
      minRating
    } = req.query;
    const filters = {};
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    if (sortBy) filters.sortBy = sortBy;
    if (minRating) filters.minRating = parseInt(minRating);
    const result = await reviewService.getTutorReviews(userId, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    const successResult = result;
    return res.status(200).json({
      success: true,
      data: successResult.data,
      pagination: successResult.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var reviewController = {
  getTutorReviews: getTutorReviews2
};

// src/modules/tutor/review/review.router.ts
var router7 = Router7();
router7.get(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  reviewController.getTutorReviews
);
var reviewRouter = router7;

// src/modules/admin/admin.router.ts
import { Router as Router8 } from "express";

// src/modules/admin/admin.service.ts
var createSuccessResponse = (message, data, pagination) => ({
  success: true,
  message,
  data,
  pagination
});
var createErrorResponse = (message) => ({
  success: false,
  message
});
var getAllUsers = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;
    const orderBy = {};
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
        let profile = null;
        if (user.role === "TUTOR") {
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
        } else if (user.role === "STUDENT") {
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
    return createSuccessResponse("Users retrieved successfully", usersWithDetails, pagination);
  } catch {
    return createErrorResponse("Failed to retrieve users");
  }
};
var updateUser = async (userId, data) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return createErrorResponse("User not found");
    if (data.role && !["STUDENT", "TUTOR", "ADMIN"].includes(data.role)) {
      return createErrorResponse("Invalid role");
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
    return createSuccessResponse("User updated successfully", updatedUser);
  } catch {
    return createErrorResponse("Failed to update user");
  }
};
var deleteUser = async (userId) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return createErrorResponse("User not found");
    await prisma.user.delete({ where: { id: userId } });
    return createSuccessResponse("User deleted successfully", { userId });
  } catch {
    return createErrorResponse("Failed to delete user");
  }
};
var getAllTutors = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      minRating,
      maxHourlyRate,
      experienceYears,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        { headline: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } }
      ];
    }
    if (minRating !== void 0) where.rating = { gte: minRating };
    if (maxHourlyRate !== void 0) where.hourlyRate = { lte: maxHourlyRate };
    if (experienceYears !== void 0) where.experienceYears = { gte: experienceYears };
    const orderBy = {};
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
          categories: tutor.categories.map((tc) => tc.category),
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
    return createSuccessResponse("Tutors retrieved successfully", tutorsWithUserInfo, pagination);
  } catch {
    return createErrorResponse("Failed to retrieve tutors");
  }
};
var updateTutorProfile3 = async (tutorId, data) => {
  try {
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    if (!existingTutor) return createErrorResponse("Tutor not found");
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
    return createSuccessResponse("Tutor profile updated successfully", { ...updatedTutor, user });
  } catch {
    return createErrorResponse("Failed to update tutor profile");
  }
};
var deleteTutor = async (tutorId) => {
  try {
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    if (!existingTutor) return createErrorResponse("Tutor not found");
    await prisma.tutorProfile.delete({ where: { id: tutorId } });
    return createSuccessResponse("Tutor deleted successfully", { tutorId });
  } catch {
    return createErrorResponse("Failed to delete tutor");
  }
};
var getAllCategories = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "name",
      sortOrder = "asc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    const orderBy = {};
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
    return createSuccessResponse("Categories retrieved successfully", categories, pagination);
  } catch {
    return createErrorResponse("Failed to retrieve categories");
  }
};
var createCategory = async (data) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    });
    if (existingCategory) return createErrorResponse("Category with this name already exists");
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null
      }
    });
    return createSuccessResponse("Category created successfully", category);
  } catch {
    return createErrorResponse("Failed to create category");
  }
};
var updateCategory = async (categoryId, data) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!existingCategory) return createErrorResponse("Category not found");
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: data.name }
      });
      if (nameExists) return createErrorResponse("Category with this name already exists");
    }
    const updateData = {};
    if (data.name !== void 0) updateData.name = data.name;
    if (data.description !== void 0) updateData.description = data.description ?? null;
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });
    return createSuccessResponse("Category updated successfully", updatedCategory);
  } catch {
    return createErrorResponse("Failed to update category");
  }
};
var deleteCategory = async (categoryId) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!existingCategory) return createErrorResponse("Category not found");
    const inUse = await prisma.tutorCategory.count({
      where: { categoryId }
    });
    if (inUse > 0) return createErrorResponse("Cannot delete category that is assigned to tutors");
    await prisma.category.delete({ where: { id: categoryId } });
    return createSuccessResponse("Category deleted successfully", { categoryId });
  } catch {
    return createErrorResponse("Failed to delete category");
  }
};
var getAllBookings = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy = "bookingDate",
      sortOrder = "desc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        { meetingLink: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } }
      ];
    }
    if (status) where.status = status;
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = startDate;
      if (endDate) where.bookingDate.lte = endDate;
    }
    const orderBy = {};
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
    return createSuccessResponse("Bookings retrieved successfully", bookingsWithUserInfo, pagination);
  } catch {
    return createErrorResponse("Failed to retrieve bookings");
  }
};
var updateBooking = async (bookingId, data) => {
  try {
    const existingBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!existingBooking) return createErrorResponse("Booking not found");
    const updateData = {};
    if (data.status !== void 0) updateData.status = data.status;
    if (data.amount !== void 0) updateData.amount = data.amount;
    if (data.isPaid !== void 0) updateData.isPaid = data.isPaid;
    if (data.meetingLink !== void 0) updateData.meetingLink = data.meetingLink;
    if (data.notes !== void 0) updateData.notes = data.notes;
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
    return createSuccessResponse("Booking updated successfully", { ...updatedBooking, studentProfile, tutorProfile });
  } catch {
    return createErrorResponse("Failed to update booking");
  }
};
var getAllReviews = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      minRating,
      maxRating,
      isVerified,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } }
      ];
    }
    if (minRating !== void 0) where.rating = { gte: minRating };
    if (maxRating !== void 0) where.rating = { lte: maxRating };
    if (isVerified !== void 0) where.isVerified = isVerified;
    const orderBy = {};
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
    return createSuccessResponse("Reviews retrieved successfully", reviewsWithUserInfo, pagination);
  } catch {
    return createErrorResponse("Failed to retrieve reviews");
  }
};
var updateReview = async (reviewId, data) => {
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
    if (!existingReview) return createErrorResponse("Review not found");
    if (data.rating !== void 0 && (data.rating < 1 || data.rating > 5)) {
      return createErrorResponse("Rating must be between 1 and 5");
    }
    const updateData = {};
    if (data.rating !== void 0) updateData.rating = data.rating;
    if (data.comment !== void 0) updateData.comment = data.comment;
    if (data.isVerified !== void 0) updateData.isVerified = data.isVerified;
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
    if (data.rating !== void 0) {
      await updateTutorRating(updatedReview.tutorProfile.userId);
    }
    return createSuccessResponse("Review updated successfully", {
      ...updatedReview,
      studentProfile,
      tutorProfile
    });
  } catch {
    return createErrorResponse("Failed to update review");
  }
};
var deleteReview = async (reviewId) => {
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
    if (!existingReview) return createErrorResponse("Review not found");
    const tutorUserId = existingReview.tutorProfile.userId;
    await prisma.review.delete({ where: { id: reviewId } });
    await updateTutorRating(tutorUserId);
    return createSuccessResponse("Review deleted successfully", { reviewId });
  } catch {
    return createErrorResponse("Failed to delete review");
  }
};
var updateTutorRating = async (tutorUserId) => {
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
var getPlatformStats = async () => {
  try {
    const now = /* @__PURE__ */ new Date();
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
      prisma.user.count({ where: { role: "TUTOR" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { isPaid: true },
        _sum: { amount: true }
      }),
      prisma.booking.count({
        where: {
          status: { in: ["CONFIRMED", "PENDING"] },
          bookingDate: { gte: now }
        }
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.category.count(),
      prisma.review.count(),
      prisma.tutorProfile.aggregate({
        _avg: { rating: true }
      })
    ]);
    const stats = {
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
    return createSuccessResponse("Platform statistics retrieved successfully", stats);
  } catch {
    return createErrorResponse("Failed to retrieve platform statistics");
  }
};
var sendNotification = async (data) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });
    if (!user) return createErrorResponse("User not found");
    const validTypes = ["BOOKING", "REVIEW", "PAYMENT", "SYSTEM", "REMINDER"];
    if (!validTypes.includes(data.type)) return createErrorResponse("Invalid notification type");
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        relatedId: data.relatedId,
        relatedType: data.relatedType
      }
    });
    return createSuccessResponse("Notification sent successfully", notification);
  } catch {
    return createErrorResponse("Failed to send notification");
  }
};
var adminService = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTutors,
  updateTutorProfile: updateTutorProfile3,
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

// src/modules/admin/admin.controller.ts
var parseQueryParams = (req, type) => {
  const { query } = req;
  const result = {};
  if (query.page) result.page = parseInt(query.page);
  if (query.limit) result.limit = parseInt(query.limit);
  if (query.search) result.search = query.search;
  if (query.sortBy) result.sortBy = query.sortBy;
  if (query.sortOrder) result.sortOrder = query.sortOrder;
  switch (type) {
    case "users":
      if (query.role) result.role = query.role;
      if (query.status) result.status = query.status;
      break;
    case "tutors":
      if (query.minRating) result.minRating = parseFloat(query.minRating);
      if (query.maxHourlyRate) result.maxHourlyRate = parseFloat(query.maxHourlyRate);
      if (query.experienceYears) result.experienceYears = parseInt(query.experienceYears);
      break;
    case "bookings":
      if (query.status) result.status = query.status;
      if (query.startDate) result.startDate = new Date(query.startDate);
      if (query.endDate) result.endDate = new Date(query.endDate);
      break;
    case "reviews":
      if (query.minRating) result.minRating = parseInt(query.minRating);
      if (query.maxRating) result.maxRating = parseInt(query.maxRating);
      if (query.isVerified) result.isVerified = query.isVerified === "true";
      break;
  }
  return result;
};
var handleServiceResponse = (res, result) => {
  if (!result.success) {
    return res.status(400).json(result);
  }
  const response = {
    success: true,
    message: result.message,
    data: result.data
  };
  if (result.pagination) {
    response.pagination = result.pagination;
  }
  return res.status(200).json(response);
};
var getParamAsString = (param) => {
  if (!param) return null;
  if (Array.isArray(param)) return param[0] || null;
  return param;
};
var getAllUsers2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const filters = parseQueryParams(req, "users");
    const result = await adminService.getAllUsers(filters);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateUser2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetUserId = getParamAsString(req.params.userId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!targetUserId) return res.status(400).json({ success: false, message: "User ID is required" });
    const updateData = {
      name: req.body.name,
      role: req.body.role,
      status: req.body.status,
      emailVerified: req.body.emailVerified
    };
    const result = await adminService.updateUser(targetUserId, updateData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var deleteUser2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetUserId = getParamAsString(req.params.userId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!targetUserId) return res.status(400).json({ success: false, message: "User ID is required" });
    const result = await adminService.deleteUser(targetUserId);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getAllTutors2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const filters = parseQueryParams(req, "tutors");
    const result = await adminService.getAllTutors(filters);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateTutorProfile4 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const tutorId = getParamAsString(req.params.tutorId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!tutorId) return res.status(400).json({ success: false, message: "Tutor ID is required" });
    const updateData = {
      headline: req.body.headline,
      bio: req.body.bio,
      hourlyRate: req.body.hourlyRate,
      experienceYears: req.body.experienceYears,
      education: req.body.education,
      certifications: req.body.certifications,
      rating: req.body.rating,
      totalReviews: req.body.totalReviews,
      completedSessions: req.body.completedSessions
    };
    const result = await adminService.updateTutorProfile(tutorId, updateData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var deleteTutor2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const tutorId = getParamAsString(req.params.tutorId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!tutorId) return res.status(400).json({ success: false, message: "Tutor ID is required" });
    const result = await adminService.deleteTutor(tutorId);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getAllCategories2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const filters = parseQueryParams(req, "categories");
    const result = await adminService.getAllCategories(filters);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var createCategory2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const categoryData = {
      name: req.body.name,
      description: req.body.description ?? null
    };
    if (!categoryData.name || categoryData.name.trim() === "") {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const result = await adminService.createCategory(categoryData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const categoryId = getParamAsString(req.params.categoryId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!categoryId) return res.status(400).json({ success: false, message: "Category ID is required" });
    const updateData = {
      name: req.body.name,
      description: req.body.description !== void 0 ? req.body.description ?? null : void 0
    };
    const result = await adminService.updateCategory(categoryId, updateData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const categoryId = getParamAsString(req.params.categoryId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!categoryId) return res.status(400).json({ success: false, message: "Category ID is required" });
    const result = await adminService.deleteCategory(categoryId);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getAllBookings2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const filters = parseQueryParams(req, "bookings");
    const result = await adminService.getAllBookings(filters);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateBooking2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookingId = getParamAsString(req.params.bookingId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID is required" });
    const updateData = {
      status: req.body.status,
      amount: req.body.amount,
      isPaid: req.body.isPaid,
      meetingLink: req.body.meetingLink,
      notes: req.body.notes
    };
    const result = await adminService.updateBooking(bookingId, updateData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getAllReviews2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const filters = parseQueryParams(req, "reviews");
    const result = await adminService.getAllReviews(filters);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateReview2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const reviewId = getParamAsString(req.params.reviewId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!reviewId) return res.status(400).json({ success: false, message: "Review ID is required" });
    const updateData = {
      rating: req.body.rating,
      comment: req.body.comment,
      isVerified: req.body.isVerified
    };
    const result = await adminService.updateReview(reviewId, updateData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var deleteReview2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const reviewId = getParamAsString(req.params.reviewId);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!reviewId) return res.status(400).json({ success: false, message: "Review ID is required" });
    const result = await adminService.deleteReview(reviewId);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getPlatformStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const result = await adminService.getPlatformStats();
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var sendNotification2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const notificationData = {
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      relatedId: req.body.relatedId,
      relatedType: req.body.relatedType
    };
    if (!notificationData.userId || !notificationData.title || !notificationData.type) {
      return res.status(400).json({ success: false, message: "User ID, title, and type are required" });
    }
    const result = await adminService.sendNotification(notificationData);
    handleServiceResponse(res, result);
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUser: updateUser2,
  deleteUser: deleteUser2,
  getAllTutors: getAllTutors2,
  updateTutorProfile: updateTutorProfile4,
  deleteTutor: deleteTutor2,
  getAllCategories: getAllCategories2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2,
  getAllBookings: getAllBookings2,
  updateBooking: updateBooking2,
  getAllReviews: getAllReviews2,
  updateReview: updateReview2,
  deleteReview: deleteReview2,
  getPlatformStats: getPlatformStats2,
  sendNotification: sendNotification2
};

// src/modules/admin/admin.router.ts
var router8 = Router8();
router8.get("/users", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getAllUsers);
router8.put("/users/:userId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.updateUser);
router8.delete("/users/:userId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.deleteUser);
router8.get("/tutors", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getAllTutors);
router8.put("/tutors/:tutorId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.updateTutorProfile);
router8.delete("/tutors/:tutorId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.deleteTutor);
router8.get("/categories", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getAllCategories);
router8.post("/categories", auth_middleware_default("ADMIN" /* ADMIN */), adminController.createCategory);
router8.put("/categories/:categoryId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.updateCategory);
router8.delete("/categories/:categoryId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.deleteCategory);
router8.get("/bookings", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getAllBookings);
router8.put("/bookings/:bookingId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.updateBooking);
router8.get("/reviews", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getAllReviews);
router8.put("/reviews/:reviewId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.updateReview);
router8.delete("/reviews/:reviewId", auth_middleware_default("ADMIN" /* ADMIN */), adminController.deleteReview);
router8.get("/stats", auth_middleware_default("ADMIN" /* ADMIN */), adminController.getPlatformStats);
router8.post("/notifications", auth_middleware_default("ADMIN" /* ADMIN */), adminController.sendNotification);
var adminRouter = router8;

// src/modules/tutor/bookingMng/booking.router.ts
import { Router as Router9 } from "express";

// src/modules/tutor/bookingMng/booking.service.ts
var getTutorBookings = async (userId, filters) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const whereConditions = {
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
        bookingDate: "desc"
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to get bookings",
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
var getBookingById = async (userId, bookingId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
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
      throw new Error("Booking not found or access denied");
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
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to get booking details"
    };
  }
};
var updateBookingStatus = async (userId, bookingId, data) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        tutorProfileId: tutorProfile.id
      }
    });
    if (!existingBooking) {
      throw new Error("Booking not found or access denied");
    }
    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED", "RESCHEDULED"],
      COMPLETED: [],
      CANCELLED: [],
      RESCHEDULED: ["CONFIRMED", "CANCELLED"]
    };
    const allowedStatuses = allowedTransitions[existingBooking.status];
    if (!allowedStatuses.includes(data.status)) {
      throw new Error(`Cannot change status from ${existingBooking.status} to ${data.status}`);
    }
    const updateData = {
      status: data.status
    };
    if (data.meetingLink && data.status === "CONFIRMED") {
      updateData.meetingLink = data.meetingLink;
    }
    if (data.notes) {
      updateData.notes = data.notes;
    }
    if (data.status === "CANCELLED") {
      if (existingBooking.availabilitySlotId) {
        await prisma.availabilitySlot.update({
          where: { id: existingBooking.availabilitySlotId },
          data: { isBooked: false }
        });
      }
    }
    if (data.status === "COMPLETED") {
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
          title: "Booking Status Updated",
          message: `Your booking status has been changed to ${data.status} by the tutor.`,
          type: "BOOKING",
          relatedId: bookingId,
          relatedType: "Booking"
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
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update booking status"
    };
  }
};
var getBookingStats = async (userId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
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
          status: "PENDING"
        }
      }),
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: "CONFIRMED"
        }
      }),
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: "COMPLETED"
        }
      }),
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: "CANCELLED"
        }
      }),
      prisma.booking.count({
        where: {
          tutorProfileId: tutorProfile.id,
          status: "CONFIRMED",
          bookingDate: {
            gte: /* @__PURE__ */ new Date()
          }
        }
      }),
      prisma.booking.aggregate({
        where: {
          tutorProfileId: tutorProfile.id,
          status: "COMPLETED",
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
        completionRate: totalBookings > 0 ? Math.round(completedBookings / totalBookings * 100) : 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get booking statistics"
    };
  }
};
var bookingService = {
  getTutorBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats
};

// src/modules/tutor/bookingMng/booking.controller.ts
var getTutorBookings2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      status,
      studentId,
      startDate,
      endDate,
      page = "1",
      limit = "10"
    } = req.query;
    const filters = {};
    if (status) {
      if (!Object.values(BookingStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status"
        });
      }
      filters.status = status;
    }
    if (studentId) filters.studentId = studentId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    const result = await bookingService.getTutorBookings(userId, filters);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getBookingById2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }
    const result = await bookingService.getBookingById(userId, bookingId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var updateBookingStatus2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }
    const { status, notes, meetingLink } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }
    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status"
      });
    }
    const result = await bookingService.updateBookingStatus(userId, bookingId, {
      status,
      notes,
      meetingLink
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getBookingStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await bookingService.getBookingStats(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var bookingController = {
  getTutorBookings: getTutorBookings2,
  getBookingById: getBookingById2,
  updateBookingStatus: updateBookingStatus2,
  getBookingStats: getBookingStats2
};

// src/modules/tutor/bookingMng/booking.router.ts
var router9 = Router9();
router9.get(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  bookingController.getTutorBookings
);
router9.get(
  "/stats",
  auth_middleware_default("TUTOR" /* TUTOR */),
  bookingController.getBookingStats
);
router9.get(
  "/:bookingId",
  auth_middleware_default("TUTOR" /* TUTOR */),
  bookingController.getBookingById
);
router9.put(
  "/:bookingId/status",
  auth_middleware_default("TUTOR" /* TUTOR */),
  bookingController.updateBookingStatus
);
var bookingRouter = router9;

// src/modules/studentReview/studentReview.router.ts
import { Router as Router10 } from "express";

// src/modules/studentReview/studentReview.service.ts
var createReview = async (studentUserId, data) => {
  try {
    const { bookingId, rating, comment } = data;
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!studentProfile) {
      return {
        success: false,
        message: "Student profile not found",
        statusCode: 404
      };
    }
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
        message: "Booking not found",
        statusCode: 404
      };
    }
    if (booking.studentUserId !== studentUserId) {
      return {
        success: false,
        message: "You can only review your own bookings",
        statusCode: 403
      };
    }
    if (booking.status !== "COMPLETED") {
      return {
        success: false,
        message: "You can only review completed bookings",
        statusCode: 400
      };
    }
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    });
    if (existingReview) {
      return {
        success: false,
        message: "Review already exists for this booking",
        statusCode: 400
      };
    }
    const tutorUser = await prisma.user.findUnique({
      where: { id: booking.tutorProfile.userId },
      select: {
        name: true,
        image: true
      }
    });
    const review = await prisma.review.create({
      data: {
        studentUserId,
        studentProfileId: studentProfile.id,
        tutorProfileId: booking.tutorProfileId,
        bookingId,
        rating,
        comment: comment || null,
        // Convert undefined to null
        isVerified: true
      }
    });
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
      message: "Review created successfully",
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
  } catch (error) {
    console.error("Create review service error:", error);
    return {
      success: false,
      message: "Failed to create review",
      statusCode: 500
    };
  }
};
var getStudentReviews = async (studentUserId, filters) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!studentProfile) {
      return {
        success: false,
        message: "Student profile not found",
        statusCode: 404
      };
    }
    const whereConditions = {
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
    let orderBy = {};
    switch (filters.sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
        break;
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
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
    const formattedReviews = reviewsWithUserInfo.map((review) => ({
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
          averageRating: reviews.length > 0 ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length : 0
        }
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Get student reviews service error:", error);
    return {
      success: false,
      message: "Failed to get reviews",
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
var updateReview3 = async (studentUserId, reviewId, data) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!studentProfile) {
      return {
        success: false,
        message: "Student profile not found",
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
        message: "Review not found",
        statusCode: 404
      };
    }
    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: "You can only update your own reviews",
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
        message: "Booking not found",
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
    const updateData = {};
    if (data.rating !== void 0) updateData.rating = data.rating;
    if (data.comment !== void 0) updateData.comment = data.comment || null;
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
      message: "Review updated successfully",
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to update review",
      statusCode: 500
    };
  }
};
var deleteReview3 = async (studentUserId, reviewId) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!studentProfile) {
      return {
        success: false,
        message: "Student profile not found",
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
        message: "Review not found",
        statusCode: 404
      };
    }
    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: "You can only delete your own reviews",
        statusCode: 403
      };
    }
    await prisma.review.delete({
      where: { id: reviewId }
    });
    const tutorReviews = await prisma.review.findMany({
      where: { tutorProfileId: review.tutorProfileId }
    });
    const averageRating = tutorReviews.length > 0 ? tutorReviews.reduce((sum, rev) => sum + rev.rating, 0) / tutorReviews.length : 0;
    await prisma.tutorProfile.update({
      where: { id: review.tutorProfileId },
      data: {
        rating: averageRating,
        totalReviews: tutorReviews.length
      }
    });
    return {
      success: true,
      message: "Review deleted successfully"
    };
  } catch (error) {
    console.error("Delete review service error:", error);
    return {
      success: false,
      message: "Failed to delete review",
      statusCode: 500
    };
  }
};
var getReviewById = async (studentUserId, reviewId) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!studentProfile) {
      return {
        success: false,
        message: "Student profile not found",
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
        message: "Review not found",
        statusCode: 404
      };
    }
    if (review.studentUserId !== studentUserId) {
      return {
        success: false,
        message: "You can only view your own reviews",
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to get review",
      statusCode: 500
    };
  }
};
var studentReviewService = {
  createReview,
  getStudentReviews,
  updateReview: updateReview3,
  deleteReview: deleteReview3,
  getReviewById
};

// src/modules/studentReview/studentReview.controller.ts
var createReview2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const { bookingId, rating, comment } = req.body;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    const result = await studentReviewService.createReview(studentUserId, {
      bookingId,
      rating,
      comment
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Create review controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getStudentReviews2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      page = "1",
      limit = "10",
      sortBy = "newest",
      tutorId
    } = req.query;
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    };
    if (tutorId) filters.tutorId = tutorId;
    const result = await studentReviewService.getStudentReviews(studentUserId, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Get student reviews controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var updateReview4 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }
    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    const result = await studentReviewService.updateReview(
      studentUserId,
      reviewId,
      { rating, comment }
    );
    return res.status(result.success ? 200 : result.statusCode || 400).json(result);
  } catch (error) {
    console.error("Update review controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var deleteReview4 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }
    const result = await studentReviewService.deleteReview(studentUserId, reviewId);
    return res.status(result.success ? 200 : result.statusCode || 400).json(result);
  } catch (error) {
    console.error("Delete review controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getReviewById2 = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    const { reviewId } = req.params;
    if (!studentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }
    const result = await studentReviewService.getReviewById(studentUserId, reviewId);
    return res.status(result.success ? 200 : result.statusCode || 404).json(result);
  } catch (error) {
    console.error("Get review by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var studentReviewController = {
  createReview: createReview2,
  getStudentReviews: getStudentReviews2,
  updateReview: updateReview4,
  deleteReview: deleteReview4,
  getReviewById: getReviewById2
};

// src/modules/studentReview/studentReview.router.ts
var router10 = Router10();
router10.post(
  "/",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentReviewController.createReview
);
router10.get(
  "/",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentReviewController.getStudentReviews
);
router10.put(
  "/:reviewId",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentReviewController.updateReview
);
router10.delete(
  "/:reviewId",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentReviewController.deleteReview
);
router10.get(
  "/:reviewId",
  auth_middleware_default("STUDENT" /* STUDENT */),
  studentReviewController.getReviewById
);
var studentReviewRouter = router10;

// src/modules/studentCategory/studentCategory.router.ts
import { Router as Router11 } from "express";

// src/modules/studentCategory/studentCategory.service.ts
var getAllCategories3 = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return {
      success: true,
      data: categories,
      message: "Categories fetched successfully"
    };
  } catch (error) {
    console.error("Get categories service error:", error);
    return {
      success: false,
      message: "Failed to fetch categories",
      data: []
    };
  }
};
var getCategoryById = async (categoryId) => {
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
        message: "Category not found",
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
      message: "Category fetched successfully"
    };
  } catch (error) {
    console.error("Get category by ID service error:", error);
    return {
      success: false,
      message: "Failed to fetch category",
      statusCode: 500
    };
  }
};
var getTutorsByCategory = async (categoryId, filters) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return {
        success: false,
        message: "Category not found",
        statusCode: 404
      };
    }
    const whereConditions = {
      tutorCategories: {
        some: {
          categoryId
        }
      }
    };
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
    const orderBy = {};
    if (filters.sortBy === "hourlyRate") {
      orderBy.hourlyRate = filters.sortOrder || "desc";
    } else if (filters.sortBy === "experienceYears") {
      orderBy.experienceYears = filters.sortOrder || "desc";
    } else {
      orderBy.rating = filters.sortOrder || "desc";
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
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
    const formattedTutors = tutors.map((tutor) => ({
      id: tutor.id,
      userId: tutor.userId,
      name: tutor.name || "Unknown",
      email: tutor.email || "",
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
      categories: tutor.categories.map((tc) => tc.category)
    }));
    return {
      success: true,
      data: {
        category,
        tutors: formattedTutors,
        statistics: {
          totalTutors: total,
          averageRating: tutors.length > 0 ? tutors.reduce((sum, tutor) => sum + tutor.rating, 0) / tutors.length : 0,
          averageHourlyRate: tutors.length > 0 ? tutors.reduce((sum, tutor) => sum + tutor.hourlyRate, 0) / tutors.length : 0
        }
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      message: "Tutors fetched successfully"
    };
  } catch (error) {
    console.error("Get tutors by category service error:", error);
    return {
      success: false,
      message: "Failed to fetch tutors",
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
var studentCategoryService = {
  getAllCategories: getAllCategories3,
  getCategoryById,
  getTutorsByCategory
};

// src/modules/studentCategory/studentCategory.controller.ts
var getAllCategories4 = async (req, res) => {
  try {
    const result = await studentCategoryService.getAllCategories();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getCategoryById2 = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId || Array.isArray(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }
    const result = await studentCategoryService.getCategoryById(categoryId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getTutorsByCategory2 = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId || Array.isArray(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }
    const {
      page = "1",
      limit = "10",
      minRating,
      maxHourlyRate,
      sortBy = "rating",
      sortOrder = "desc"
    } = req.query;
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };
    if (minRating) filters.minRating = parseFloat(minRating);
    if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate);
    const result = await studentCategoryService.getTutorsByCategory(categoryId, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var studentCategoryController = {
  getAllCategories: getAllCategories4,
  getCategoryById: getCategoryById2,
  getTutorsByCategory: getTutorsByCategory2
};

// src/modules/studentCategory/studentCategory.router.ts
var router11 = Router11();
router11.get(
  "/",
  studentCategoryController.getAllCategories
);
router11.get(
  "/:categoryId",
  studentCategoryController.getCategoryById
);
router11.get(
  "/:categoryId/tutors",
  studentCategoryController.getTutorsByCategory
);
var studentCategoryRouter = router11;

// src/modules/tutor/getBooking/getBooking.router.ts
import { Router as Router12 } from "express";

// src/modules/tutor/getBooking/getBooking.service.ts
var getTutorAllBookings = async (userId, filters = {}) => {
  try {
    console.log("\u{1F50D} [GetBookingService] Fetching bookings for user:", userId);
    console.log("\u{1F4CB} Filters:", filters);
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found. Please complete your tutor profile.",
        data: [],
        pagination: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
    const whereConditions = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ]
    };
    if (filters.status && filters.status !== "all") {
      whereConditions.status = filters.status;
    }
    if (filters.categoryId) {
      whereConditions.categoryId = filters.categoryId;
    }
    if (filters.startDate && filters.endDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    } else if (filters.startDate) {
      whereConditions.bookingDate = {
        gte: filters.startDate
      };
    } else if (filters.endDate) {
      whereConditions.bookingDate = {
        lte: filters.endDate
      };
    }
    if (filters.isPaid !== void 0) {
      whereConditions.isPaid = filters.isPaid;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      whereConditions.OR = [
        ...whereConditions.OR || [],
        {
          studentUser: {
            name: {
              contains: searchTerm,
              mode: "insensitive"
            }
          }
        },
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive"
            }
          }
        }
      ];
    }
    if (filters.studentName) {
      whereConditions.studentUser = {
        name: {
          contains: filters.studentName,
          mode: "insensitive"
        }
      };
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.bookingDate = "desc";
    }
    const bookings = await prisma.booking.findMany({
      where: whereConditions,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        studentProfile: {
          select: {
            id: true,
            grade: true,
            subjects: true
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
      orderBy,
      skip,
      take: limit
    });
    const bookingsWithStudentInfo = await Promise.all(
      bookings.map(async (booking) => {
        const studentUser = await prisma.user.findUnique({
          where: { id: booking.studentUserId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });
        return {
          ...booking,
          studentUser: studentUser || {
            id: booking.studentUserId,
            name: "Unknown Student",
            email: "No email"
          }
        };
      })
    );
    const total = await prisma.booking.count({
      where: whereConditions
    });
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message: "Bookings fetched successfully",
      data: bookingsWithStudentInfo,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    try {
      const fallbackTutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId }
      });
      const fallbackWhereConditions = {
        tutorUserId: userId
      };
      if (fallbackTutorProfile?.id) {
        fallbackWhereConditions.OR = [
          { tutorUserId: userId },
          { tutorProfileId: fallbackTutorProfile.id }
        ];
      }
      const fallbackBookings = await prisma.booking.findMany({
        where: fallbackWhereConditions,
        take: 10,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          studentProfile: {
            select: {
              id: true,
              grade: true,
              subjects: true
            }
          }
        }
      });
      const fallbackWithUsers = await Promise.all(
        fallbackBookings.map(async (booking) => {
          const studentUser = await prisma.user.findUnique({
            where: { id: booking.studentUserId },
            select: {
              id: true,
              name: true,
              email: true
            }
          });
          return {
            ...booking,
            studentUser: studentUser || {
              id: booking.studentUserId,
              name: "Unknown Student",
              email: "No email"
            }
          };
        })
      );
      return {
        success: true,
        message: "Bookings fetched with fallback",
        data: fallbackWithUsers,
        pagination: {
          total: fallbackBookings.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: "Failed to fetch bookings: " + error.message,
        data: [],
        pagination: {
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }
};
var getTutorBookingStats = async (userId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found"
      };
    }
    const whereConditions = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ]
    };
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      rescheduledBookings,
      upcomingBookings,
      totalEarningsResult,
      recentBookings
    ] = await Promise.all([
      prisma.booking.count({ where: whereConditions }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "PENDING"
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "CONFIRMED"
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "COMPLETED"
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "CANCELLED"
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "RESCHEDULED"
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          status: "CONFIRMED",
          bookingDate: {
            gte: /* @__PURE__ */ new Date()
          }
        }
      }),
      prisma.booking.aggregate({
        where: {
          ...whereConditions,
          status: "COMPLETED",
          isPaid: true
        },
        _sum: {
          amount: true
        }
      }),
      prisma.booking.count({
        where: {
          ...whereConditions,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
          }
        }
      })
    ]);
    const totalEarnings = totalEarningsResult._sum.amount || 0;
    const completionRate = totalBookings > 0 ? Math.round(completedBookings / totalBookings * 100) : 0;
    return {
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rescheduledBookings,
        upcomingBookings,
        totalEarnings,
        completionRate,
        recentBookings,
        averageSessionPrice: completedBookings > 0 ? totalEarnings / completedBookings : 0,
        todayEarnings: 0,
        totalStudents: await prisma.booking.groupBy({
          by: ["studentUserId"],
          where: whereConditions,
          _count: true
        }).then((groups) => groups.length)
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get booking statistics"
    };
  }
};
var getPendingBookingsCount = async (userId) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found",
        data: { count: 0 }
      };
    }
    const whereConditions = {
      OR: [
        { tutorProfileId: tutorProfile.id },
        { tutorUserId: userId }
      ],
      status: "PENDING"
    };
    const count = await prisma.booking.count({
      where: whereConditions
    });
    return {
      success: true,
      message: "Pending count fetched",
      data: { count }
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to get pending count",
      data: { count: 0 }
    };
  }
};
var getBookingService = {
  getTutorAllBookings,
  getTutorBookingStats,
  getPendingBookingsCount
};

// src/modules/tutor/getBooking/getBooking.controller.ts
var getAllTutorBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const {
      status,
      categoryId,
      studentName,
      startDate,
      endDate,
      page = "1",
      limit = "10",
      sortBy = "bookingDate",
      sortOrder = "desc",
      search,
      isPaid,
      includeStudentDetails = "true"
    } = req.query;
    const filters = {};
    if (status) {
      if (status === "all") {
        filters.status = "all";
      } else if (Object.values(BookingStatus).includes(status)) {
        filters.status = status;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status"
        });
      }
    }
    if (categoryId) filters.categoryId = categoryId;
    if (studentName) filters.studentName = studentName;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;
    if (search) filters.search = search;
    if (isPaid !== void 0) filters.isPaid = isPaid === "true";
    filters.includeStudentDetails = includeStudentDetails === "true";
    const result = await getBookingService.getTutorAllBookings(userId, filters);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
var getTutorBookingStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await getBookingService.getTutorBookingStats(userId);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getPendingBookingsCount2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await getBookingService.getPendingBookingsCount(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
var getBookingController = {
  getAllTutorBookings,
  getTutorBookingStats: getTutorBookingStats2,
  getPendingBookingsCount: getPendingBookingsCount2
};

// src/modules/tutor/getBooking/getBooking.router.ts
var router12 = Router12();
router12.get(
  "/",
  auth_middleware_default("TUTOR" /* TUTOR */),
  getBookingController.getAllTutorBookings
);
router12.get(
  "/stats",
  auth_middleware_default("TUTOR" /* TUTOR */),
  getBookingController.getTutorBookingStats
);
router12.get(
  "/pending-count",
  auth_middleware_default("TUTOR" /* TUTOR */),
  getBookingController.getPendingBookingsCount
);
var getBookingRouter = router12;

// src/app.ts
var app = express();
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/admin", adminRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/tutors/availability", availabilityRouter);
app.use("/api/tutors/categories", categoryRouter);
app.use("/api/tutors/dashboard", dashboardRouter);
app.use("/api/tutors/reviews", reviewRouter);
app.use("/api/tutors/public", publicTutorRouter);
app.use("/api/tutors/bookings", bookingRouter);
app.use("/api/students", studentRouter);
app.use("/api/student/reviews", studentReviewRouter);
app.use("/api/student/categories", studentCategoryRouter);
app.use("/api/tutor/get-bookings", getBookingRouter);
app.get("/", (req, res) => {
  res.send("Hello, World! - Tutoring Platform API");
});
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 3e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app_default.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
