import { Router } from "express";
import { userRouter } from "./user.js";
import { adminRouter } from "./admin.js";
import { spaceRouter } from "./space.js";
import { SignupSchema } from "../../types/index.js";
import client from "@repo/db/client";
import { hash, compare } from "../../scrypt.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const router = Router();

router.post("/signup", async (req, res) => {
    
    const parsedData = SignupSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed"
        
        })
        return;
    }

    const hashedPassword = await hash(parsedData.data.password);

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User",
            }
        })
        res.json({
            userId: user.id
        })
    } catch (error) {
        res.status(400).json({
            message: "User already exists"
        }) 
    }
    
    res.json({
        message: "signup"
    })
});

router.post("/signin", async (req, res) => {

    const parsedData = SignupSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(403).json({
            message: "Validation failed"    
        })
        return;
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        if(!user) {
            res.status(403).json({
                message: "User not found"
            })
            return;
        }
        const passwordMatch = await compare(parsedData.data.password, user.password);
        if(!passwordMatch) {
            res.status(403).json({
                message: "Invalid password"
            })
            return;
        }
        const secret = process.env.JWT_SECRET;
        if(!secret) {
            return;
        }

        const token = jwt.sign({
            userId: user.id
        }, secret
        );

        res.json({
            token
        })
    } catch (error) {
        res.status(400).json({
            message: "Internal server error"
        })
    }
});

router.get("/elements", (req, res) => {
    
});

router.get("/avatars", (req, res) => {
    
});

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/space', spaceRouter);
