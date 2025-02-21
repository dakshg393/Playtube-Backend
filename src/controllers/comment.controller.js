import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async (req, res) => {
    const { video, content } = req.body
    const user = req.user._id

    if (!video || !(content.trim())) {
        throw new apiError(404, "Invalid data or data Not found")
    }

    try {


        const comment = await Comment.create(
            {
                content: content,
                video: new mongoose.Types.ObjectId(video),
                owner: new mongoose.Types.ObjectId(user)
            }
        )

        res
            .status(200)
            .json(new apiResponse(200, comment, "Commented Successfully"))
    } catch (error) {
        throw new apiError(400, "Somthing Went Wrong You Are not commentet on video")
    }

})

const getAllComments = asyncHandler(async(req,res)=>{
    const video = req.body.video
    if(!video.trim()){
        throw new apiError(401,"Invalid Request Data not found")
    }
    const allComments =  await Comment.find(
        {
            video:video
        }
    ).populate("owner").limit(10)
})

const updateComment = asyncHandler(async(req,res)=>{
    const {_id,content,video} = req.body
    if(!_id || !(content.trim()) || !(video.trim())){
        throw new apiError(401,"Invalid request Data not Found")
    }
try {

    const comment = await Comment.findOneAndUpdate(
        {
            _id:new mongoose.Types.ObjectId(_id),
            video:new mongoose.Types.ObjectId(video),
            owner:new mongoose.Types.ObjectId(req.user._id)
        },
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )

    res
    .status(200)
    .json(new apiResponse(200,comment,"Comment Updated Successfully"))
        
} catch (error) {
    throw new apiError(401,"Somthing Went Wrong Comment Not be Updated")
}

})

const removeComment = asyncHandler(async (req,res)=>{
    const _id = req.body._id
    if(!_id){
        throw new apiError(401,"Invalid request Data not found to remove comment")
    }

    try {
        
    const remove = await Comment.findByIdAndDelete(_id)

    res.
    status(200)
    .json(new apiResponse(200,{},"Comment remove Successfully"))
    } catch (error) {
        throw new apiError(402,"Somthing Went Wrong Comment Cant Be deleted")
    }

})

export{
    createComment,
    getAllComments,
    updateComment,
    removeComment
}