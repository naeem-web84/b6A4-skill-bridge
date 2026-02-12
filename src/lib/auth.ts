// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.APP_URL!,
    "https://skill-bridge-client-nu.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "STUDENT",
        input: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "Active",
      },
    },
  },
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,  
    requireEmailVerification: false,
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
        `,
      });
    },
  },
 
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          emailVerified: true,  
          name: profile.name, 
        };
      },
    },
  },
 
  session: {
    expiresIn: 60 * 60 * 24 * 7,  
    updateAge: 60 * 60 * 24,  
  },
 
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production", 
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});