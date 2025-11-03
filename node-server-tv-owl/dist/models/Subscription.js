import mongoose, { Schema } from "mongoose";
export const SubscriptionSchema = new Schema({
    subscriberId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subscriberType: {
        type: String,
        enum: ["regular", "member"],
        required: true,
    },
}, { timestamps: true });
// prevent duplicates
SubscriptionSchema.index({ subscriberId: 1, ownerId: 1 }, { unique: true });
export const SubscriptionModel = mongoose.models.Subscription ||
    mongoose.model("Subscription", SubscriptionSchema);
export default SubscriptionModel;
