import { Router } from "express";
import { AddElementSchema, CreateSpaceSchema } from "../../types/index.js";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user.js";

export const spaceRouter = Router();

spaceRouter.post('/', userMiddleware, async (req, res) => {

    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        })
        return;
    }

    if(!parsedData.data.mapId) {

        await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parsedData.data.dimensions.split("x").map(Number)[0] as number,
                height: parsedData.data.dimensions.split("x").map(Number)[1] as number,
                creatorId: req.userId as string,    
            }
        });
        res.json({message: "Space created"})
    }
    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements: true,
            width: true,
            height: true
        }
    })

    if(!map) {
        res.status(400).json({ message: "Map not found" });
        return;
    }

    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId as string,    
            }
        });

        await client.spaceElements.createMany({
            data: map.mapElements.map(me => ({
                spaceId: space.id,
                elementId: me.elementId,
                x: me.x,
                y: me.y,
            }))
        })
        return space;
    })
    res.json({ spaceId: space.id });
})

spaceRouter.delete('/:spaceId', userMiddleware, async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId as string
        }, select: {
            creatorId: true
        }
    })
    if(!space) {
        res.status(400).json({ message: "Space not found" });
        return;
    }

    if(space?.creatorId !== req.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
    }
    
    await client.space.delete({
        where: {
            id: req.params.spaceId as string
        }
    })
    res.json({ message: "Space deleted" });
})

spaceRouter.get('/all', userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId as string
        }
    })

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            dimensions: `${s.width}x${s.height}`,
            thumbnail: s.thumbnail
        }))
    })
})

spaceRouter.post('/element', userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({
            message: "Validation failed",
        })
        return;
    }
    const space = await client.space.findUnique({
        where: {
            id: parsedData.data.spaceId,
            creatorId: req.userId as string
        }, select: {
            width: true,
            height: true
        }
    })
    if(!space) {
        res.status(400).json({ message: "Space not found" });
        return;
    }
    await client.spaceElements.create({
        data: {
            spaceId: parsedData.data.spaceId,
            elementId: parsedData.data.elementId,
            x: parsedData.data.x,
            y: parsedData.data.y,
        }
    })
    res.json({ message: "Element added to space" });

})

spaceRouter.delete('/element', userMiddleware,(req, res) => {

})

spaceRouter.get('/:spaceId', (req, res) => {

})