import { UserRole } from '../middlewares/auth.middleware';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: UserRole;
                emailVerified: boolean;
            }
        }
    }
}