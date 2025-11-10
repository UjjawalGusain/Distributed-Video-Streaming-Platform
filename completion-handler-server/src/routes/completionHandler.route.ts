import {Router} from "express"
import completionHandlerController from "../controllers/completionHandler.controller";

const router = Router();
router.post("/add-to-completion-queue", completionHandlerController.addToQueue);

export default router;