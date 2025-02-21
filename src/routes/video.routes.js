import { Router } from "express";
import { createVideo,getVideo ,updateVideo,deleteVideo,recommendedVideos,getVideoByCategory,getTrandingVideos} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/createVideo").post(verifyJWT,upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),
createVideo)
router.route("/getVideo/:videoId").get(verifyJWT,getVideo)
router.route("/updateVideo").patch(verifyJWT,updateVideo)
router.route("/delete/:videoId").delete(verifyJWT,deleteVideo)
router.route("/recommendedVideos").get(verifyJWT,recommendedVideos)
router.route("/getVideoByCategory/:category").get(verifyJWT,getVideoByCategory)
router.route("/getTrandingVideos").get(verifyJWT,getTrandingVideos)

export default router