import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment ,getAllComments,updateComment,removeComment} from "../controllers/comment.controller.js";

const router = Router()

router.route("/createComment").post(verifyJWT,createComment)
router.route("/getAllComments").get(verifyJWT,getAllComments)
router.route("/updateComment").patch(verifyJWT,updateComment)
router.route("/removeComment").delete(verifyJWT,removeComment)

export default router