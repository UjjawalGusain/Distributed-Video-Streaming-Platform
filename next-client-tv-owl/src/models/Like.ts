import mongoose, { Schema, Document, Types } from "mongoose";

export interface Like extends Document {
    userId: Types.ObjectId;
    targetType: "Video" | "Comment";
    targetId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const LikeSchema = new Schema<Like>(
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
    },
    { timestamps: true }
);

LikeSchema.index({ userId: 1 });
LikeSchema.index({ targetId: 1 });

export const LikeModel =
    mongoose.models.Like || mongoose.model<Like>("Like", LikeSchema);

export default LikeModel;
