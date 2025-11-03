import mongoose, { Schema } from "mongoose";
export const LikeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetType: {
        type: String,
        enum: ["Video", "Comment"],
        required: true,
    },
    targetId: {
        type: Schema.Types.ObjectId,
        refPath: "targetType",
        required: true,
    },
}, { timestamps: true });
LikeSchema.index({ userId: 1 });
LikeSchema.index({ targetId: 1 });
export const LikeModel = mongoose.models.Like || mongoose.model("Like", LikeSchema);
export default LikeModel;
