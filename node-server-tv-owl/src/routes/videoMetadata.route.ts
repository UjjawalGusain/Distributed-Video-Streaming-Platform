import {Router} from "express"
import VideoMetadataController from "../controllers/videoMetadata.controller";

const router = Router();
router.get("/:videoId", VideoMetadataController.getVideoMetadata);
router.patch("/mark-metadata-publish", VideoMetadataController.updatePublishVideo);

export default router;