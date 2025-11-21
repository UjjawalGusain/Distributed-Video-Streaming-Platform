import {Router} from "express"
import UserController from "../controllers/user.controller";

const router = Router();
router.get("/:userId", UserController.getUser);

export default router;