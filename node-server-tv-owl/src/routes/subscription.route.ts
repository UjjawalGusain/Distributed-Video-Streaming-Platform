import {Router} from "express"
import SubscriptionController from "../controllers/subscription.controller";

const router = Router();
router.post("/toggle", SubscriptionController.toggleSubscription);
router.get("/is-subscribed", SubscriptionController.isSubscribed);

export default router;