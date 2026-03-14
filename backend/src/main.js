import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { ImageProvider } from "./ImageProvider.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { connectMongo } from "../connectMongo.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/verifyAuthToken.js";
import { handleImageFileErrors, imageMiddlewareFactory } from "./routes/imageUploadMiddleware.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR", false) || "uploads";
const app = express();
const myMongoClient = connectMongo();
await myMongoClient.connect();
const imageProvider = new ImageProvider(myMongoClient);
const credentialsProvider = new CredentialsProvider(myMongoClient);

app.use(express.json());
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));

app.get("/api/hello", (req, res) => {
    res.send("Hello world");
});

app.use("/api/images", verifyAuthToken);
app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req, res) => {
        if (!req.file || typeof req.body?.name !== "string" || req.body.name.trim() === "") {
            return res.status(400).send({
                error: "Bad Request",
                message: "Missing image file or name"
            });
        }

        const imageId = await imageProvider.createImage({
            src: `/uploads/${req.file.filename}`,
            name: req.body.name.trim(),
            authorId: req.userInfo?.username
        });

        return res.status(201).send({ imageId: String(imageId) });
    }
);
registerImageRoutes(app, imageProvider);
registerAuthRoutes(app, credentialsProvider);

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
