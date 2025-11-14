import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import VideoModel from '../models/Video';
import { Types } from "mongoose";
import VideoMetadataModel from '../models/Metadata';
import ReactionModel from '../models/Reaction';
import CommentModel from '../models/Comment';




class ReactionController {

    async reactTarget(req: Request, res: Response) {
        try {
            const { targetType, userId, reactionType, targetId } = req.body;

            if (!userId || !Types.ObjectId.isValid(userId)) {
                return res.status(400).json(failure(400, "Invalid userId"));
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

            if (reactionType !== "Like" && reactionType !== "Dislike") {
                return res
                    .status(400)
                    .json(failure(400, "Reaction type can only be 'Like' or 'Dislike'"));
            }

            let targetDoc;
            if (targetType === "Video") {
                targetDoc = await VideoMetadataModel.findOne({ videoId: new Types.ObjectId(targetId) });
                if (!targetDoc) {
                    return res.status(404).json(failure(404, "Target video not found"));
                }
                if (!targetDoc.isPublished) {
                    return res
                        .status(400)
                        .json(failure(400, "Target video is not published yet"));
                }
            } else {
                targetDoc = await CommentModel.findById(targetId);
                if (!targetDoc) {
                    return res.status(404).json(failure(404, "Target comment not found"));
                }
            }

            // 3 cases


            const existingReaction = await ReactionModel.findOne({
                userId,
                targetId,
                targetType,
            });

            if (existingReaction) {
                if (existingReaction.reactionType === reactionType) {

                    await ReactionModel.findByIdAndDelete(existingReaction._id);
                    return res
                        .status(200)
                        .json(success(200, {}, `You already ${reactionType}d this ${targetType} so we removed it`));
                }

                existingReaction.reactionType = reactionType;
                await existingReaction.save();

                return res
                    .status(200)
                    .json(success(200, {}, `Reaction updated to ${reactionType}`));
            }

            // no reaction exists
            await ReactionModel.create({
                userId,
                targetId,
                targetType,
                reactionType,
            });

            return res
                .status(200)
                .json(success(200, {}, `${reactionType} successful`));
        } catch (error: any) {
            console.error("Reaction error:", error);


            return res
                .status(500)
                .json(failure(500, `Internal server error: ${error}`));
        }
    }

    async countReactions(req: Request, res: Response) {
        try {

            const { targetId, reactionType, targetType } = req.query;

            console.log(req.query)

            if (!targetId || Array.isArray(targetId) || !Types.ObjectId.isValid(String(targetId))) {
                return res.status(400).json(failure(400, "Invalid targetId"));
            }

            if (targetType !== "Video" && targetType !== "Comment") {
                return res
                    .status(400)
                    .json(failure(400, "Target type can only be 'Comment' or 'Video'"));
            }

            if (reactionType && reactionType !== "Like" && reactionType !== "Dislike") {
                return res
                    .status(400)
                    .json(failure(400, "Reaction type can only be 'Like' or 'Dislike'"));
            }

            let targetDoc;
            if (targetType === "Video") {
                targetDoc = await VideoMetadataModel.findOne({ videoId: new Types.ObjectId(String(targetId)) });
                if (!targetDoc) {
                    return res.status(404).json(failure(404, "Target video not found"));
                }
                if (!targetDoc.isPublished) {
                    return res
                        .status(400)
                        .json(failure(400, "Target video is not published yet"));
                }
            } else {
                targetDoc = await CommentModel.findById(targetId);
                if (!targetDoc) {
                    return res.status(404).json(failure(404, "Target comment not found"));
                }
            }

            const query: any = { targetId, targetType };
            if (reactionType) query.reactionType = reactionType;

            const reactionCount = await ReactionModel.countDocuments(query);
            console.log("reactionCount: ", reactionCount);
            return res
                .status(200)
                .json(success(200, { reactionType, targetType, targetId, count: reactionCount }, `Count successful`));
        } catch (error) {
            console.error("Reaction count error:", error);

            return res
                .status(500)
                .json(failure(500, `Internal server error: ${error}`));
        }
    }

    async getUserReaction(req: Request, res: Response) {
        try {
            const { targetId, targetType, userId } = req.query;

            if (!targetId || Array.isArray(targetId) || !Types.ObjectId.isValid(String(targetId))) {
                return res.status(400).json(failure(400, "Invalid targetId"));
            }

            if (!userId || Array.isArray(userId) || !Types.ObjectId.isValid(String(userId)))
                return res.status(400).json(failure(400, "Invalid userId"));

            if (targetType !== "Video" && targetType !== "Comment")
                return res.status(400).json(failure(400, "Invalid targetType"));

            const reaction = await ReactionModel.findOne({
                targetId,
                targetType,
                userId
            });

            return res.status(200).json(success(200, {
                reactionType: reaction?.reactionType || null
            }));
        } catch (err) {
            return res.status(500).json(failure(500, "Internal Server Error"));
        }
    }


};

export default new ReactionController();