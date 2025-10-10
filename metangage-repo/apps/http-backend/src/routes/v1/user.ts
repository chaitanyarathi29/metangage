import { Router } from "express";
import { userMiddleware } from "../../middleware/user.js";
import { UpdateMetadataSchema } from "../../types/index.js";
import client from "@repo/db/client";

export const userRouter = Router();

userRouter.post('/metadata',userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        })
        return;
    }
    try {
        const updated = await client.user.update({
            where: {
                id: req.userId ?? ""
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({ message: "Metadata updated successfully" })
        return;
    } catch (error) {
        res.status(400).json({
            error: error,
            message: "Failed to update metadata"
        })
        return;
    }        
})

userRouter.get('/metadata/bulk', userMiddleware, async (req, res) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = userIdString.slice(1, -1).split(",");
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true,
            avatar: true
        }
    })
    res.json({ 
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarUrl: m.avatar?.imageUrl
        }))
    })
})