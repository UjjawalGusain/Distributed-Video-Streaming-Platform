import mongoose, { Schema, Document, Types } from "mongoose";

export interface Video extends Document {
    userId: Types.ObjectId;
    shortDescription?: string;
    longDescription?: string;
    formats: { resolution: string; url: string }[];
    tags?: string[];
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

export const VideoSchema = new Schema<Video>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    shortDescription: {
        type: String,
    },
    longDescription: {
        type: String,
    },
    formats: [
        {
            resolution: { type: String, required: true },
            url: { type: String, required: true },
        },
    ],
    tags: {
        type: [String],
        default: [],
    },
    duration: {
        type: Number,
        required: true,
    },
},
    { timestamps: true }
);

export const VideoModel =
    mongoose.models.Video || mongoose.model<Video>("Video", VideoSchema);

export default VideoModel;
