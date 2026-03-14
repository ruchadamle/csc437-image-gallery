import express from "express";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = {
            username
        };

        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            }
        );
    });
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

export function registerAuthRoutes(app, credentialsProvider) {
    const router = express.Router();

    router.post("/users", async (req, res) => {
        const { username, email, password } = req.body ?? {};

        if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password"
            });
        }

        try {
            const registered = await credentialsProvider.registerUser(
                username.trim(),
                email.trim(),
                password
            );

            if (!registered) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
            }

            return res.status(201).send();
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    });

    router.post("/auth/tokens", async (req, res) => {
        const { username, password } = req.body ?? {};

        if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
        }

        try {
            const isValid = await credentialsProvider.verifyPassword(username.trim(), password);
            if (!isValid) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
            }

            const token = await generateAuthToken(username.trim());
            return res.status(200).send({ token });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal Server Error" });
        }
    });

    app.use("/api", router);
}
