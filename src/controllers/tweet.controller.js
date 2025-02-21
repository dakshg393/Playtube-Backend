import {Tweet} from "../models/tweet.model.js"
import {Subscription} from "../models/subscription.model.js"

import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import mongoose from "mongoose"

const createTweet = asyncHandler(async (req,res)=>{
    const content = req.body.content?.trim()
    const user = req.user._id

    if(!content){
        throw new apiError(401,"Cannot get content for Post")
    }

    const tweet = await Tweet.create({
        content,
        owner:new mongoose.Types.ObjectId(user)
    })

    if(!tweet){
        throw new apiError(404,"Tweet not Creted")
    }

    res
    .status(new apiResponse(200,tweet,"Tweet Created Successfully"))
})

const recommandedTweets = asyncHandler(async(req,res)=>{

    const user = req.user._id

    const tweets =await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup:{
                from:"Tweet",
                localField:"channel",
                foreignField:"owner",
                as:"tweets"
                
            }
        },
        {
            $unwind:"tweets"
        },
        {
            $sort:{
                'tweets.createdAt':-1
            }
        },
        {
            $project:{
                _id:0,
                tweets:"$tweets"
            }
        },
        {
            $limit:12
        }
    ])


    if(!tweets){
        throw new apiError(401,"Tweet not fetched Db error")
    }

    res
    .status(200)
    .json(new apiError(200,tweets,"Tweets fetched Successfully"))
})

const getUserTweets = asyncHandler(async(req,res)=>{
    const user = req.params.user

    if(!user){
        throw new apiError(401,"User not found ")
    }

    const tweets =await Tweet.find({owner:new mongoose.Types.ObjectId(user)})

    if(!tweets){
        throw new apiError(401,"Tweet not fetched Db error")
    }

    res
    .status(200)
    .json(new apiError(200,tweets,"Tweets fetched Successfully"))
})

const updateTweet = asyncHandler(async (req,res)=>{
    const {_id,content} = req.body
    const user = req.user._id
    if(!_id || !(content.trim())){
        throw new apiError(401,"Cannot get deta to Update")
    }

    const updateTweet =await Tweet.findOneAndUpdate(
        {
            _id:new mongoose.Types.ObjectId(_id),
            owner:new mongoose.Types.ObjectId(user)
        },
        {
            content:content
        },
        {
            new:true
        }
    )

    if(!updateTweet){
        throw new apiError(401,"Tweet Cant'Be updated")
    }

    res
    .status(200)
    .json(new apiResponse(200,updateTweet,"Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req,res)=>{
    const id = req.params.id
    const user = req.user.id
    if(!id || !user){
        throw new apiError(401,"Tweet id not Found")
    }

    const deleteTweet = await Tweet.deleteOne(
        {
            _id:new mongoose.Types.ObjectId(id),
            owner:new mongoose.Types.ObjectId(user)
        }
    )

    if(!deleteTweet){
        throw new apiError(401,"Tweet Cat't be deleted")
    }

    res
    .status(200)
    .json(new apiResponse(200,{},"Tweet Deleted Successfully"))

})



export {
    createTweet,
    recommandedTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
}