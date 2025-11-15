import {Router} from "express"
import SubscriptionController from "../controllers/subscription.controller";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";


const router = Router();
router.post("/toggle", verifyNextAuth, SubscriptionController.toggleSubscription);
router.get("/is-subscribed", SubscriptionController.isSubscribed);

export default router;