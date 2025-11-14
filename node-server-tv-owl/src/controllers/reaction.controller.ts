import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import VideoModel from '../models/Video';
import VideoMetadataModel from '../models/Metadata';
import ReactionModel from '../models/Reaction';
import CommentModel from '../models/Comment';




class ReactionController {

    async reactTarget(req: Request, res: Response) {
        try {
            const { targetType, userId, reactionType, targetId } = req.body;

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
                targetDoc = await VideoMetadataModel.findOne({videoId: targetId});
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

            const existingReaction = await ReactionModel.findOne({
                userId,
                targetId,
                targetType,
            });

            if (existingReaction) {
                if (existingReaction.reactionType === reactionType) {
                    return res
                        .status(400)
                        .json(failure(400, `You already ${reactionType}d this ${targetType}`));
                }

                existingReaction.reactionType = reactionType;
                await existingReaction.save();

                return res
                    .status(200)
                    .json(success(200, {}, `Reaction updated to ${reactionType}`));
            }

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

            if (error.code === 11000) {
                return res
                    .status(400)
                    .json(failure(400, "You already reacted to this target"));
            }

            return res
                .status(500)
                .json(failure(500, "Internal server error"));
        }
    }

};

export default new ReactionController();