import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";
import UserModel from '../models/User';
import { Types } from "mongoose";
import SubscriptionModel from '../models/Subscription';



class SubscriptionController {

    async toggleSubscription(req: Request, res: Response) {
        try {
            const { subscriptionType, ownerId } = req.body;

            const subscriberId = req?.user?.id;
            if (subscriptionType !== "regular") {
                if (subscriptionType === "premium") {
                    return res.status(400).json(failure(400, "Premium subscription not available yet"));
                }
                return res.status(400).json(failure(400, "Invalid subscription type"));
            }

            if (!subscriberId || !Types.ObjectId.isValid(subscriberId)) {
                return res.status(400).json(failure(400, "Invalid subscriberId"));
            }

            if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
                return res.status(400).json(failure(400, "Invalid ownerId"));
            }

            const subscriberExists = await UserModel.exists({ _id: subscriberId });
            if (!subscriberExists) return res.status(404).json(failure(404, "Subscriber not found"));

            const ownerExists = await UserModel.exists({ _id: ownerId });
            if (!ownerExists) return res.status(404).json(failure(404, "Owner not found"));


            const existingSubscription = await SubscriptionModel.findOne({ subscriberId, ownerId });

            if (existingSubscription) {
                await existingSubscription.deleteOne();
                return res.status(200).json(success(200, {}, "Unsubscribed channel"));
            }

            await SubscriptionModel.create({
                subscriberId,
                ownerId,
                subscriberType: subscriptionType,
            })

            return res
                .status(200)
                .json(success(200, {}, `Subscribed channel`));

        } catch (error: any) {
            console.error("Subscription error:", error);


            return res
                .status(500)
                .json(failure(500, `Internal server error: ${error}`));
        }
    }

    async isSubscribed(req: Request, res: Response) {
        try {
            const { subscriberId, subscriptionType, ownerId } = req.query;

            if (subscriptionType !== "regular") {
                if (subscriptionType === "premium") {
                    return res.status(400).json(failure(400, "Premium subscription not available yet"));
                }
                return res.status(400).json(failure(400, "Invalid subscription type"));
            }

            if (!subscriberId || Array.isArray(subscriberId) || !Types.ObjectId.isValid(String(subscriberId))) {
                return res.status(400).json(failure(400, "Invalid subscriberId"));
            }
            if (!ownerId || Array.isArray(ownerId) || !Types.ObjectId.isValid(String(ownerId))) {
                return res.status(400).json(failure(400, "Invalid ownerId"));
            }

            const subscriberExists = await UserModel.exists({ _id: subscriberId });
            if (!subscriberExists) return res.status(404).json(failure(404, "Subscriber not found"));

            const ownerExists = await UserModel.exists({ _id: ownerId });
            if (!ownerExists) return res.status(404).json(failure(404, "Owner not found"));


            const existingSubscription = await SubscriptionModel.findOne({ subscriberId, ownerId, subscriberType: subscriptionType });
            
            return res.status(200).json(success(200, {
                subscriptionStatus: existingSubscription ? "subscribed" : "unsubscribed"
            }));

        } catch (error) {
            return res.status(500).json(failure(500, `Internal Server Error: ${error}`));
        }
    }


};

export default new SubscriptionController();