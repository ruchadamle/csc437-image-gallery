import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { ImageProvider } from "./ImageProvider.js";
import { connectMongo } from "../connectMongo.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();
const myMongoClient = connectMongo();
await myMongoClient.connect();
const imageProvider = new ImageProvider(myMongoClient);

app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req, res) => {
    res.send("Hello world");
});

app.get("/api/images", async (req, res) => {
    try {
        await waitDuration(1000);
        const images = await imageProvider.getAllImages();
        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Unable to fetch images" });
    }
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
