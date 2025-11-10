import {Router} from "express"
import VideoController from "../controllers/video.controller";
import { multerUpload, thumbnailUpload } from "../middlewares/multer.middleware";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";

const router = Router();
router.post("/start-upload", 
    verifyNextAuth,
    VideoController.startUpload);
router.post("/part-upload", 
    verifyNextAuth,
    multerUpload.single("fileChunk"),
    VideoController.partUpload
);
router.post("/complete-upload", verifyNextAuth, VideoController.completeUpload);
router.post("/submit-video", verifyNextAuth, thumbnailUpload.single("thumbnail"), VideoController.submitVideoForPublish);
router.get("/:videoId", VideoController.getVideo);
router.patch("/publish-formats", verifyNextAuth, VideoController.addVideoUrl)

export default router;