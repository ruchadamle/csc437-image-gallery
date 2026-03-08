import { getEnvVar } from "./getEnvVar.js";
import { ObjectId } from "mongodb";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const imageCollectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        const userCollectionName = getEnvVar("USERS_COLLECTION_NAME", false) || "users";
        this.imageCollection = this.mongoClient.db().collection(imageCollectionName);
        this.userCollectionName = userCollectionName;
    }

    buildImageWithAuthorPipeline(matchCondition = null) {
        const pipeline = [];
        if (matchCondition) {
            pipeline.push({ $match: matchCondition });
        }

        pipeline.push({
            $lookup: {
                from: this.userCollectionName,
                let: { imageAuthorId: "$authorId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    {
                                        $eq: [
                                            "$_id",
                                            {
                                                $convert: {
                                                    input: "$$imageAuthorId",
                                                    to: "objectId",
                                                    onError: null,
                                                    onNull: null
                                                }
                                            }
                                        ]
                                    },
                                    { $eq: ["$_id", "$$imageAuthorId"] },
                                    { $eq: ["$username", "$$imageAuthorId"] }
                                ]
                            }
                        }
                    }
                ],
                as: "author"
            }
        });
        pipeline.push({
            $set: {
                author: { $arrayElemAt: ["$author", 0] }
            }
        });

        return pipeline;
    }

    getAllImages() {
        return this.imageCollection.aggregate(this.buildImageWithAuthorPipeline()).toArray();
    }

    async getOneImage(imageId) {
        const images = await this.imageCollection
            .aggregate(this.buildImageWithAuthorPipeline({ _id: new ObjectId(imageId) }))
            .toArray();

        return images[0] || null;
    }

    async updateImageName(imageId, newName) {
        const updateResult = await this.imageCollection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );

        return updateResult.matchedCount;
    }
}
