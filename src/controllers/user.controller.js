import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const genertaeAccesssAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {

        throw new apiError(500, "Somthing went wrong while genrating Access and Refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //req.body 
    //make validation like object us not empty
    //check if user alredy exist  from username or email
    //if file is exist or  nor check for image and avater//if then uplod to cloudanary
    // create a user object --create entry in db
    //remove password from refresh tokem field
    //is check for user creation 
    //if not then send error

    const { userName, email, fullName, password } = req.body
    console.log(email)

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }
    //pr checks both username and emailid
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existingUser) {
        throw new apiError(400, "User will alredy exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {

        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log(`coverImagepat ${coverImageLocalPath}`)
    if (!avatarLocalPath) {
        throw new apiError(400, "avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "avatar file is required")

    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    console.log(user)

    if (!createdUser) {

        throw new apiError(500, "Somthing went wrong while registring the User")
    }

    res.status(200).json(new apiResponse(200, "User Register Successfuly ", createdUser))
})


const loginUser = asyncHandler(async (req, res) => {

    //  req body ->
    // username or email
    //user 
    //password check 
    //if password check then 
    //access token and refresh token 
    //send token in cokkie 

    const { email, userName, password } = req.body
    console.log(email)
    if (!(userName || email)) {
        throw new apiError(200, "Username or email is required")
    }

    const user = await User.findOne({ 
        $or: [{ email }, { userName }] })

    if (!user) {
        throw new apiError(400, "User not Found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid login Credentials")
    }

    const { accessToken, refreshToken } = await genertaeAccesssAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new apiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken

            },
                "User logged In Successfully"
            )
        )

})


const logoutUser =  asyncHandler(async(req,res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            //unset removes the field
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new apiResponse(200,{},"User logout Successfuly"))

})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"Refresh Token Expired or Used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} =await genertaeAccesssAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(200,{accessToken,newRefreshToken},"Access Token Refreshed Successfuly")
        )
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Refresh Token")
    }
})


const changeCurrentUserPassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} =req.body

    console.log(req.user)
    const user = await User.findById(req.user?._id)
   
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid Old Password")
    }

    user.password = newPassword
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200,{},"Password Change Successfuly"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{

    const user = req.user
    if(!user){
        throw new apiError("You are not logged in or somthing went wrong")
    }

    return res
    .status(200)
    .json(new apiResponse(200,user,"Current user fatched Successfully"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName,email } = req.body
    if(!fullName && !email){
        throw new apiError(400,"All fields are required ")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new :true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Account details updated Successfuly"))
})


const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing ")
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new apiError(400,"Error While Uploding avatar")
    }

    const user =await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")


    return res
    .status(200)
    .json(new apiResponse(200,user,"Avatar updated Successfully"))
})




const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(400,"Cover Image file is missing ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new apiError(400,"Error While Uploding Cover Image")
    }

    const user =await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Cover Image updated Successfully"))
})


const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params
    if(!username.trim()){
        throw new apiError("Username is Missing ")
    }

    const channel = await User.aggregate([
        {
            $match:{
                userName:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: { $ifNull: ["$subscribers", []] },
                },
                channelSubscribedToCount:{
                    $size: { $ifNull: ["$subscribedTo", []] },
                },
                isSubscribedTo:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }

            }
        },
        //only below values are return in channel value
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribedTo:1,
                avatar:1,
                coverImage:1,
                email:1
                
            }
        }
    ])

    if(!channel?.length){
        throw new apiError("404,Channel does not exit")
    }
    return res
    .status(200)
    .json(
        new apiResponse(200,channel,"User Channel fatched Successfuly")
    )
})


const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(req.user._id)

            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }

                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            user[0].watchHistory,
            "watch History fatched successfully"
        )
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}


