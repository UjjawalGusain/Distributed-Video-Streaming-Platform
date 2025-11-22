import UserModel from "../models/User";
import { Request, Response } from 'express';
import { success, failure } from "../interfaces/Response";
import SubscriptionModel from "../models/Subscription";

interface UserResponse {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    isPremium: boolean;
    subscriberCount: number;
}

class UserController {
    async getUser(req: Request, res: Response) {
        try {

            const { userId } = req.params;

            if (!userId) {
                return res.status(404).json(failure(404, "User id not found"));
            }
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json(failure(404, "User not found"));
            }

            const subscriberCount = await SubscriptionModel.countDocuments({ownerId: userId})

            const payload: UserResponse = {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isPremium: user.isPremium,
                subscriberCount,
            }

            return res.status(200).json(success(200, payload, "User retrieved"));
        } catch (err) {
            console.error("[AuthController.getUser]", err);
            return res.status(500).json(failure(500, "Internal Server Error"));
        }
    }

    async getUserSubscribersCount(req: Request, res: Response) {

        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(404).json(failure(404, "User id not found"));
            }
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json(failure(404, "User not found"));
            }
    
            const subscriberCount = await SubscriptionModel.countDocuments({ownerId: userId})
            const payload = {
                userId,
                subscriberCount
            }
            return res.status(200).json(success(200, payload, "User susbcribers retrieved"));
        } catch (error) {
            console.error("Error in user susbcriber count: ", error);
            return res.status(500).json(failure(500, "Internal Server Error"));
        }
    }

};

export default new UserController();