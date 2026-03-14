import express from "express";
import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(app, imageProvider) {
    const router = express.Router();

    router.get("/images", async (req, res) => {
        try {
            await waitDuration(1000);
            const images = await imageProvider.getAllImages();
            return res.json(images);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Unable to fetch images" });
        }
    });

    router.get("/images/:imageId", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        try {
            const image = await imageProvider.getOneImage(imageId);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }

            return res.json(image);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    });

    router.patch("/images/:imageId", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        if (!req.body || Array.isArray(req.body) || typeof req.body.name !== "string") {
            return res.status(400).send({
                error: "Bad Request",
                message: "Request body must be JSON with a string field named 'name'"
            });
        }

        if (req.body.name.length > MAX_NAME_LENGTH) {
            return res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        try {
            const image = await imageProvider.getOneImage(imageId);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            if (image.authorId !== req.userInfo?.username) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "This user does not own this image"
                });
            }

            const matchedCount = await imageProvider.updateImageName(imageId, req.body.name);
            if (matchedCount === 0) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            return res.status(204).send();
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    });

    app.use("/api", router);
}
