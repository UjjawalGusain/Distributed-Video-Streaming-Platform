import {Router} from "express"
import ReactionController from "../controllers/reaction.controller";

const router = Router();
router.post("/", ReactionController.reactTarget);

export default router;