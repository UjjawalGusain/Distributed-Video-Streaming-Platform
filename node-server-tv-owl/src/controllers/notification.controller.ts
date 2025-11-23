import { Request, Response } from "express";
import { success, failure } from "../interfaces/Response";
import UserModel from "../models/User";
import { Types } from "mongoose";
import NotificationModel from "../models/Notification";

class NotificationController {
    async addComment(req: Request, res: Response) {
        try {
            const { userId, message, url } = req.body;

            if (!userId || !Types.ObjectId.isValid(userId)) {
                return res.status(400).json(failure(400, "Invalid userId"));
            }

            const userExists = await UserModel.exists({ _id: userId });
            if (!userExists) {
                return res.status(404).json(failure(404, "User not found"));
            }

            if (!message || message.trim() === "") {
                return res.status(400).json(failure(400, "Message not provided or empty"));
            }

            await NotificationModel.create({
                userId,
                message,
                url: url ?? null
            });

            return res
                .status(200)
                .json(success(200, { message: "Notification created successfully" }));
        } catch (error) {
            console.log("Error:", error);
            return res
                .status(500)
                .json(failure(500, "Error while creating new notification"));
        }
    }
}

export default new NotificationController();
