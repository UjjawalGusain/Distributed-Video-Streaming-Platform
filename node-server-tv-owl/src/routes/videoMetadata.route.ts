import {Router} from "express"
import VideoMetadataController from "../controllers/videoMetadata.controller";

const router = Router();
router.post("/", VideoMetadataController.getVideoMetadata);

export default router;