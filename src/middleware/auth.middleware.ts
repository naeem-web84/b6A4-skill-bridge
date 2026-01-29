// middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth'

export enum UserRole {
    STUDENT = "STUDENT",
    TUTOR = "TUTOR",
    ADMIN = "ADMIN"
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerified: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

// Main authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get session from Better Auth
        const session = await betterAuth.api.getSession({
            headers: req.headers as any
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        // Extract role from additionalFields (default to STUDENT)
        const userRole = (session.user.role as UserRole) || UserRole.STUDENT;

        // Validate role
        const validRoles = Object.values(UserRole);
        if (!validRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Invalid user role configuration."
            });
        }

        // Attach user to request
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: userRole,
            emailVerified: session.user.emailVerified
        };

        next();
    } catch (error: any) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication."
        });
    }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated."
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};


const auth = (...roles: UserRole[]) => {
    return [
        authenticate,
        roles.length > 0 ? authorize(...roles) : (req: Request, res: Response, next: NextFunction) => next()
    ];
};

export default auth;