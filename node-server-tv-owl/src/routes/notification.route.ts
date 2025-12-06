import {Router} from "express"
import NotificationController from "../controllers/notification.controller";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";

const router = Router();
router.post("/", NotificationController.addNotification);
router.get("/", verifyNextAuth, NotificationController.getNotifications);

export default router;