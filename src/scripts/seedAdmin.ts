import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth.middleware";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Naeem Islam",
      email: "naeemislam.hasan74@gmail.com",
      password: "naeem1234",
      role: UserRole.STUDENT, 
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) { 
      return;
    }
 
    const betterAuthUrl = process.env.BETTER_AUTH_URL || "http://localhost:5000";
    const signUpUrl = `${betterAuthUrl}/api/auth/sign-up/email`;
 

    const response = await fetch(signUpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": process.env.APP_URL || "http://localhost:3000"
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();

    if (!response.ok) { 
      throw new Error(`Signup API failed: ${result.message || response.statusText}`);
    }
 

    const updatedAdmin = await prisma.user.update({
      where: { email: adminData.email },
      data: {
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    }); 

  } catch (error) { 
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();