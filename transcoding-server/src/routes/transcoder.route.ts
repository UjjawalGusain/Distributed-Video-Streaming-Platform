import {Router} from "express"
import TranscoderController from "../controllers/transcoder.controller";

const router = Router();
router.post("/add-to-queue", TranscoderController.addToQueue);

export default router;