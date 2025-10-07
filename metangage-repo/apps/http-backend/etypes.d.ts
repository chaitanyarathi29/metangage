declare namespace Express {
    export interface Request {
        userId?: string;
        role?: "Admin" | "User";
    }
}