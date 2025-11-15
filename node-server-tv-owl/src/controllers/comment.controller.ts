import UserModel from "../models/User";
import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import { Types } from "mongoose";
import CommentModel from "../models/Comment";

class CommentController {

    async createComment(req: Request, res: Response) {
        try {
            const { text, userId, targetType, targetId } = req.body;

            if (!text || typeof text !== "string" || text.trim() === "") {
                return res.status(400).json(failure(400, "No text entered"));
            }

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

            await CommentModel.create({
                userId, targetType, targetId, text
            })

            return res
                .status(200)
                .json(success(200, {userId, targetType, targetId, text}, `Comment successful`));

        } catch (error) {
            return res
                    .status(400)
                    .json(failure(400, `Error while commenting: ${error}`));
        }

    }

}

export default new CommentController();