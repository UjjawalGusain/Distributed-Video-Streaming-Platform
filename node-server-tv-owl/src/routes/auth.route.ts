import {Router} from "express"
import AuthController from "../controllers/auth.controller";

const router = Router();
router.post("/user", AuthController.getUser);

export default router;