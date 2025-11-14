import {Router} from "express"
import ReactionController from "../controllers/reaction.controller";

const router = Router();
router.post("/", ReactionController.reactTarget);
router.get("/count", ReactionController.countReactions);
router.get("/user", ReactionController.getUserReaction);

export default router;