import mongoose, { Schema, Document, Types } from "mongoose";

export interface Video extends Document {
    userId: Types.ObjectId;
    longDescription?: string;
    originalVideoUrl?: string;
    formats: { resolution: string; url: string }[];
    masterPlaylistUrl: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const VideoSchema = new Schema<Video>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    masterPlaylistUrl: {
        type: String,
    },
    originalVideoUrl: {
        type: String
    },
    tags: {
        type: [String],
        default: [],
    },
},
    { timestamps: true }
);

export const VideoModel =
    mongoose.models.Video || mongoose.model<Video>("Video", VideoSchema);

export default VideoModel;
