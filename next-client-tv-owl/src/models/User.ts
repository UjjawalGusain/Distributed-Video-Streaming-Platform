import mongoose, { Schema, Document, Types } from "mongoose";

export interface User extends Document {
    username: string;
    email: string;
    about?: string;
    watchHistory: Types.ObjectId[];
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = new Schema<User>({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
        ],
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    about: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
});
UserSchema.index({ username: 1 }, { unique: true });


export const UserModel =
    mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
