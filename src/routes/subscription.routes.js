import { Router } from "express";

import {subscribe,unSubscribe} from '../controllers/subscriptions.controller.js'

const router = Router()

router.route("/subscribe").post(subscribe)
router.route("/unSubscribe/:channel").delete(unSubscribe)

export default router