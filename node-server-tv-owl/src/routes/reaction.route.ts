import {Router} from "express"
import ReactionController from "../controllers/reaction.controller";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";

const router = Router();
router.post("/", verifyNextAuth, ReactionController.reactTarget);
router.get("/count", ReactionController.countReactions);
router.get("/user", ReactionController.getUserReaction);

export default router;