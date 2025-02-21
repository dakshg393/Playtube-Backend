import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import { commentRoutes,likeRoutes,playlistRoutes,subscriptionRoutes,tweetRoutes,userRoutes,videoRoutes} from './routes/index.js'

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/video",videoRoutes)
app.use("/api/v1/subscription",subscriptionRoutes)
app.use("/api/v1/comment",commentRoutes)
app.use("/api/v1/like",likeRoutes)
app.use("/api/v1/playlist",playlistRoutes)
app.use("/api/v1/tweet",tweetRoutes)


export {app}