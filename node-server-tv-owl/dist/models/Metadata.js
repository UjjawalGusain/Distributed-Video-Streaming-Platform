import mongoose, { Schema } from "mongoose";
export const VideoMetadataSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
}, { timestamps: true });
VideoMetadataSchema.index({ userId: 1 });
VideoMetadataSchema.index({ videoId: 1 });
VideoMetadataSchema.index({ tags: 1 });
VideoMetadataSchema.index({ title: "text" });
VideoMetadataSchema.index({ userId: 1, tags: 1 });
export const VideoMetadataModel = mongoose.models.VideoMetadata ||
    mongoose.model("VideoMetadata", VideoMetadataSchema);
export default VideoMetadataModel;
