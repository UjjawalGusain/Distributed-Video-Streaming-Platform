import {Router} from "express"
import CommentController from "../controllers/comment.controller";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";

const router = Router();
router.post("/", verifyNextAuth, CommentController.createComment);

export default router;