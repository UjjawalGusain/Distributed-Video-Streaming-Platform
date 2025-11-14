import mongoose, { Schema, Document, Types } from "mongoose";

export interface Reaction extends Document {
    userId: Types.ObjectId;
    targetType: "Video" | "Comment";
    reactionType: "Like" | "Dislike";
    targetId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const ReactionSchema = new Schema<Reaction>(
    {
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
        reactionType: {
            type: String,
            enum: ["Like", "Dislike"],
            required: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            refPath: "targetType",
            required: true,
        },
    },
    { timestamps: true }
);

ReactionSchema.index({ userId: 1 });
ReactionSchema.index({ targetId: 1 });
ReactionSchema.index(
    { userId: 1, targetId: 1, targetType: 1 },
    { unique: true }
);

export const ReactionModel =
    mongoose.models.Reaction || mongoose.model<Reaction>("Reaction", ReactionSchema);

export default ReactionModel;
