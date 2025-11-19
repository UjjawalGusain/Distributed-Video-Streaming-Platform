import UserModel from "../models/User";
import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import mongoose, { Types, PipelineStage } from "mongoose";
import CommentModel from "../models/Comment";

const getCommentOnVideoAggregatePipeline = (
    videoId: string,
    limit: number,
    page: number
) => {
    return [
        {
            $match: {
                targetId: new mongoose.Types.ObjectId(videoId),
                targetType: "Video",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        {
            $addFields: {
                userDetails: { $arrayElemAt: ["$userDetails", 0] },
            },
        },
        {
            $unset: [
                "userDetails.watchHistory",
                "userDetails.isPremium"
            ]
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ] as PipelineStage[];
};



class CommentController {

    async createComment(req: Request, res: Response) {
        try {
            const { text, targetType, targetId } = req.body;
            const userId = req?.user?.id;

            if (!userId || !Types.ObjectId.isValid(userId)) {
                return res.status(400).json(failure(400, "Invalid userId"));
            }

            if (!text || typeof text !== "string" || text.trim() === "") {
                return res.status(400).json(failure(400, "No text entered"));
            }

            const userExists = await UserModel.exists({ _id: userId });
            if (!userExists) return res.status(404).json(failure(404, "User not found"));

            if (!targetId || !Types.ObjectId.isValid(targetId)) {
                return res.status(400).json(failure(400, "Invalid targetId"));
            }

            if (targetType !== "Video" && targetType !== "Comment") {
                return res
                    .status(400)
                    .json(failure(400, "Target type can only be 'Comment' or 'Video'"));
            }

            await CommentModel.create({
                userId, targetType, targetId, text
            })

            return res
                .status(200)
                .json(success(200, { userId, targetType, targetId, text }, `Comment successful`));

        } catch (error) {
            return res
                .status(400)
                .json(failure(400, `Error while commenting: ${error}`));
        }

    }

    async getCommentsOnVideo(req: Request, res: Response) {
        try {
            const { videoId, page = 1, limit = 10 } = req.body;

            if (!videoId || !Types.ObjectId.isValid(videoId)) {
                return res.status(400).json(failure(400, "Invalid videoId"));
            }

            const pipeline = getCommentOnVideoAggregatePipeline(videoId, limit, page);

            const comments = await CommentModel.aggregate(pipeline);

            return res
                .status(200)
                .json(success(200, comments, "Comments fetched"));
        } catch (error) {
            return res
                .status(500)
                .json(failure(500, `Error while fetching comments: ${error}`));
        }
    }

}

export default new CommentController();