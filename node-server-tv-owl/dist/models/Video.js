import mongoose, { Schema } from "mongoose";
export const VideoSchema = new Schema({
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
}, { timestamps: true });
export const VideoModel = mongoose.models.Video || mongoose.model("Video", VideoSchema);
export default VideoModel;
