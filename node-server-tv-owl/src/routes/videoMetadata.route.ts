import {Router} from "express"
import VideoMetadataController from "../controllers/videoMetadata.controller";

const router = Router();
router.get("/feed", VideoMetadataController.getUserFeed);
router.get("/related-videos", VideoMetadataController.getUserRelatedVideoRecommendation);
router.get("/user-videos/:userId", VideoMetadataController.getUserVideos);
router.get("/:videoId", VideoMetadataController.getVideoMetadata);
router.patch("/mark-metadata-publish", VideoMetadataController.updatePublishVideo);

export default router;