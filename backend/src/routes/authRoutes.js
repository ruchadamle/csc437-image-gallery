import express from "express";

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

    app.use("/api", router);
}
