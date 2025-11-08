import {Router} from "express"
import VideoController from "../controllers/video.controller";
import { multerUpload, thumbnailUpload } from "../middlewares/multer.middleware";

const router = Router();
router.post("/start-upload", VideoController.startUpload);
router.post("/part-upload", 
    multerUpload.single("fileChunk"),
    VideoController.partUpload
);
router.post("/complete-upload", VideoController.completeUpload);
router.post("/submit-video", thumbnailUpload.single("thumbnail"), VideoController.submitVideoForPublish);
router.post("/", VideoController.getVideo);

export default router;