import {Router} from "express"
import NotificationController from "../controllers/notification.controller";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";

const router = Router();
router.post("/", NotificationController.addComment);
router.get("/", verifyNextAuth, NotificationController.getComments);

export default router;