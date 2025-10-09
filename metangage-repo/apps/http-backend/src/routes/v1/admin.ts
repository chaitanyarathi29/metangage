import { Router } from "express";
import client from "@repo/db/client";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types/index.js";
import { adminMiddleware } from "../../middleware/admin.js";

export const adminRouter = Router();

adminRouter.post('/element', async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
            error: parsedData.error
        })
        return;
    }
    try {
        const element = await client.element.create({
            data: {
                imageUrl: parsedData.data.imageUrl,
                width: parsedData.data.width,
                height: parsedData.data.height,
                static: parsedData.data.static,
            }
        })
        res.json({ id: element.id })
    } catch (error) {
        res.status(400).json({
            message: "Failed to create element"
        })
        return;
    }
})

adminRouter.put('/element/:elementId', adminMiddleware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
            error: parsedData.error
        })
        return;
    }
    await client.element.update({
        where: {
            id: req.params.elementId as string
        },
        data: {
            imageUrl: parsedData.data.imageUrl as string
        }   
    })
    res.json({ message: "Element updated"});
})

adminRouter.post('/avatar', adminMiddleware, async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
            error: parsedData.error
        })
        return;
    }
    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl,
        }
    })
    res.json({ 
        message: "Avatar created",
        id: avatar.id 
    })
})

adminRouter.post('/map', adminMiddleware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
            error: parsedData.error
        })
        return;
    }
    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            width: parseInt(parsedData.data.dimensions.split("x")[0] as string),
            height: parseInt(parsedData.data.dimensions.split("x")[1] as string),
            thumbnail: parsedData.data.thumbnail,
            mapElements: {
                create: parsedData.data.defaultElements.map(de => ({
                    elementId: de.elementId,
                    x: de.x,
                    y: de.y,
                })) 
            }
        }
    })
    res.json({ id: map.id })
})