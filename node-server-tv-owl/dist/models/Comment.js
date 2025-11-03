import mongoose, { Schema } from "mongoose";
export const CommentSchema = new Schema({
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
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ targetId: 1 });
export const CommentModel = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default CommentModel;
