import {Router} from "express"
import VideoController from "../controllers/video.controller";
import { multerUpload, thumbnailUpload } from "../middlewares/multer.middleware";
import { verifyNextAuth } from "../middlewares/verifyNextAuth.middleware";
import {validateObjectId} from "../middlewares/validateObjectId.middleware"

const router = Router();
router.post("/start-upload", 
    verifyNextAuth,
    VideoController.startUpload);
router.post("/part-upload", 
    verifyNextAuth,
    multerUpload.single("fileChunk"),
    VideoController.partUpload
);
router.post("/complete-upload", 
    verifyNextAuth, 
    VideoController.completeUpload);
router.post("/submit-video", 
    verifyNextAuth, 
    thumbnailUpload.single("thumbnail"), VideoController.submitVideoForPublish);
router.get("/:videoId", validateObjectId, VideoController.getVideo);
router.patch("/publish-formats", 
    // verifyNextAuth, 
    VideoController.addVideoUrl);

router.delete("/", 
    verifyNextAuth, 
    VideoController.deleteVideo);

export default router;
