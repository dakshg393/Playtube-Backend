import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createPlaylist,getAllPlaylist,getPlaylistDetails,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist } from "../controllers/playlist.controller.js";

const router = Router()

router.route("/createPlaylist").post(verifyJWT,createPlaylist)
router.route("/getAllPlaylist").post(verifyJWT,getAllPlaylist)
router.route("/getPlaylistDetails").post(verifyJWT,getPlaylistDetails)
router.route("/addVideoToPlaylist").post(verifyJWT,addVideoToPlaylist)
router.route("/removeVideoFromPlaylist").post(verifyJWT,removeVideoFromPlaylist)
router.route("/deletePlaylist").post(verifyJWT,deletePlaylist)

export default router