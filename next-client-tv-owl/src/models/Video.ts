import mongoose, { Schema, Document, Types } from "mongoose";
import { User } from "./User";
import { number } from "zod";

export interface Video extends Document {
    ownerId: Types.ObjectId;
    longDescription: string;
    tags: string[];
    views: number;
    duration: number;
    isPublished: boolean;
}

export const VideoSchema = new Schema<Video>({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    longDescription: {
        type: String,
    },
    tags: {
        type: [String],
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: false,
    }
})

export const VideoModel =
    mongoose.models.Video || mongoose.model<Video>("Video", VideoSchema);

export default VideoModel;

