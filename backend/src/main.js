import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { ImageProvider } from "./ImageProvider.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { connectMongo } from "../connectMongo.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/verifyAuthToken.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();
const myMongoClient = connectMongo();
await myMongoClient.connect();
const imageProvider = new ImageProvider(myMongoClient);
const credentialsProvider = new CredentialsProvider(myMongoClient);

app.use(express.json());
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req, res) => {
    res.send("Hello world");
});

app.use("/api/images", verifyAuthToken);
registerImageRoutes(app, imageProvider);
registerAuthRoutes(app, credentialsProvider);

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
