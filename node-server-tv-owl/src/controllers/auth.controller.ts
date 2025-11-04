import UserModel from "../models/User";
import { Request, Response } from 'express';
import { success, failure, ApiResponse } from "../interfaces/Response";

interface UserResponse {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    isPremium: boolean;
}

class AuthController {
    async getUser(req: Request, res: Response<ApiResponse<UserResponse>>) {
        try {
            const { username, email, avatar } = req.body;
            if (!email) return res.status(400).json(failure(400, "Email required"));

            let user = await UserModel.findOne({ email });
            if (!user) {
                console.log("User does not exist");
                user = await UserModel.create({
                    username,
                    email,
                    avatar,
                    isPremium: false,
                });
                console.log(`New user created: ${username}`);
            }

            const payload: UserResponse = {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isPremium: user.isPremium,
            };

            return res.status(200).json(success(200, payload, "User retrieved"));
        } catch (err) {
            console.error("[AuthController.getUser]", err);
            return res.status(500).json(failure(500, "Internal Server Error"));
        }
    }

};

export default new AuthController();