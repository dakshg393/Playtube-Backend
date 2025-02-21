import { Router } from "express";
import { createTweet,recommandedTweets,getUserTweets,updateTweet,deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/createTweet").post(verifyJWT,createTweet)
router.route("/recommandedTweets").get(verifyJWT,recommandedTweets)
router.route("/getUserTweets/:user").get(verifyJWT,getUserTweets)
router.route("/updateTweet").patch(verifyJWT,updateTweet)
router.route("/deleteTweet/:id").delete(verifyJWT,deleteTweet)

export default router