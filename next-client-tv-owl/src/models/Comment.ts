import mongoose, { Schema, Document, Types } from "mongoose";

export interface Comment extends Document {
    userId: Types.ObjectId;
    targetType: "Video" | "Comment";
    targetId: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CommentSchema = new Schema<Comment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
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
            index: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

CommentSchema.index({ userId: 1 });
CommentSchema.index({ targetId: 1 });

export const CommentModel =
    mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);

export default CommentModel;
