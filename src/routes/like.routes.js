import { Router } from "express";
import { createLike,getLikesDetails,deleteLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/createLike").post(verifyJWT,createLike)
router.route("/getLikesDetails").get(verifyJWT,getLikesDetails)
router.route("/deleteLike").delete(verifyJWT,deleteLike)

export default router