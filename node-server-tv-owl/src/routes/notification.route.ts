import {Router} from "express"
import NotificationController from "../controllers/notification.controller";

const router = Router();
router.post("/", NotificationController.addComment);

export default router;