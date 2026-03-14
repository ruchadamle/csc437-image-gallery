import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

const SALT_ROUNDS = 10;

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME", false) || "users";
        this.credsCollection = this.mongoClient.db().collection(credsCollectionName);
        this.usersCollection = this.mongoClient.db().collection(usersCollectionName);
    }

    async registerUser(username, email, password) {
        const existingCreds = await this.credsCollection.findOne({ username });
        if (existingCreds) {
            return false;
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.credsCollection.insertOne({
            username,
            password: hashedPassword
        });

        await this.usersCollection.insertOne({
            username,
            email
        });

        return true;
    }

    async verifyPassword(username, plaintextPassword) {
        const storedCreds = await this.credsCollection.findOne({ username });
        if (!storedCreds || typeof storedCreds.password !== "string") {
            return false;
        }

        return bcrypt.compare(plaintextPassword, storedCreds.password);
    }
}
