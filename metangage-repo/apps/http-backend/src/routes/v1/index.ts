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
            message: "Validation failed",
            error: parsedData.error
        })
        return;
    }

    const hashedPassword = await hash(parsedData.data.password);

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "Admin" ? "Admin" : "User",
            }
        })
        res.json({
            userId: user.id
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "User already exists"

        }) 
    }
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

router.get("/elements", async (req, res) => {
    const elements = await client.element.findMany();
    res.json({ elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
    })) 
    });
});

router.get("/avatars", async (req, res) => {
    const avatars = await client.avatar.findMany();
    res.json({ avatars: avatars.map(x => ({
        id: x.id,
        imageUrl: x.imageUrl,
        name: x.name
    })) 
    });
});

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/space', spaceRouter);
