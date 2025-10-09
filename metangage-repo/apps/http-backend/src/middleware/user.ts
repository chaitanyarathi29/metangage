import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
dotenv.config();

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(400).json({ message: 'Internal server error' });
        return;
    }
    try {
        const decoded = jwt.verify(token, secret) as { role: string, userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Unauthorized' });
        return;
    }
}