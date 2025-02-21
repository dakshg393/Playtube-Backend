import mongoose from "mongoose"
import { Like } from "../models/like.model.js"

import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createLike = asyncHandler(async (req, res) => {
    const user = req.user._id

    const { type, contentId } = req.body

    if (!type || !contentId) {
        throw new apiError(401, "Invalid request Data not found")
    }

    const validType = ["Video", "Comment", "Tweet"]

    if (!validType.includes(type)) {
        throw new apiError(400, "Invalid Content Type ")
    }

    try {
        const like = await Like.create({
            type: type,
            contentId: contentId,
            likedBy: new mongoose.Types.ObjectId(user)
        })

        res
            .status(200)
            .json(new apiResponse(200, like, `${type} liked Successfully`))
    } catch (error) {
        throw new apiError(401, `Something Went  Wrong User Cant Like ${type} `)
    }


})

const getLikesDetails = asyncHandler(async (req, res) => {

    const { type, contentId } = req.body
    const user = req.user._id

    if (!type || !contentId) {
        throw new apiError(401, "Invalid request no Data found")
    }

    try {
        const likeDetails = await Like.aggregate([
            {
                $match: {
                    type,
                    contentId
                }
            },
            {
                $group: {
                    _id: "contentId",
                    totalLikes: { $sum: 1 },
                    isUserLiked: {
                        $max: { $eq: ["$likedBy", user] }  //it compare if equel it return true else  flase
                    }

                }
            },
            {
                $project: {
                    _id: 0,
                    totalLikes: "$totalLikes",
                    isUserLiked: "$isUserLiked"
                }
            }

        ])

        res
            .status(200)
            .json(new apiResponse(200, likeDetails, "Liked Fatched Successfully"))
    } catch (error) {
        throw new apiError(401, `Somthing went Wrong `)
    }

})

const deleteLike  = asyncHandler(async(req,res)=>{
    const {type,contentId}=req.body
    
    try {
        const like = await Like.deleteOne({
            type:type,
            contentId:contentId
        })

        res
        .status(200)
        .json(new apiResponse(200,{},"Dislike Successfully"))
    } catch (error) {
        throw new apiError(401, "Somthing Went Wrong User Cant be Like")
    }

})


export {
    createLike,
    getLikesDetails,
    deleteLike
}