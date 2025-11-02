import mongoose, { Schema, Document, Types } from "mongoose";

export interface VideoMetadata extends Document {
    videoId: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    thumbnail: string;
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const VideoMetadataSchema = new Schema<VideoMetadata>(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

VideoMetadataSchema.index({ userId: 1 });
VideoMetadataSchema.index({ tags: 1 });
VideoMetadataSchema.index({ title: "text" });
VideoMetadataSchema.index({ userId: 1, tags: 1 });

export const VideoMetadataModel =
    mongoose.models.VideoMetadata ||
    mongoose.model<VideoMetadata>("VideoMetadata", VideoMetadataSchema);

export default VideoMetadataModel;
