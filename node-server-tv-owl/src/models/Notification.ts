import mongoose, { Schema, Document, Types } from "mongoose";

export interface Notification extends Document {
    userId: Types.ObjectId;
    message: string;
    seen: boolean;
    url: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const NotificationSchema = new Schema<Notification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        seen: {
            type: Boolean,
            required: true,
            default: false,
        },
        url: {
            type: String,
            default: null,
        }
    },
    { timestamps: true }
);
NotificationSchema.index({ userId: 1, seen: 1 });


export const NotificationModel =
    mongoose.models.Notification || mongoose.model<Notification>("Notification", NotificationSchema);

export default NotificationModel;
