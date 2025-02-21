import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";

import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


const createPlaylist = asyncHandler(async (req, res) => {

    const { name, video, description } = req.body
    const user = req.user

    if (!(name.trim())) {
        throw new apiError(404, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description ? description : "",
        videos: video ? [video] : [],
        owner: user._id
    })

    if (!playlist) {
        throw new apiError(404, `Somthing went Wrong While creating playlist`)
    }

    res
        .send(200)
        .json(new apiResponse(200, playlist, "Playlist created Successfully"))


})

const getAllPlaylist = asyncHandler(async (req, res) => {
    const user = req.user._id

    const playlist = Playlist.aggregate([
        {
            $match: {
                owner: user
            }
        },
        {
            $addFields: {
                firstVideo: { $arrayElemAt: ["$videos", 0] }  //Extrect first video from videos field in watch hiistory
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "firstVideo",
                foreignField: "_id",
                as: "thumbnail"
            }
        },
        {
            $unwind: $thumbnail                  // (flaten the field)
        },
        {
            $project: {
                name: 1,
                description: 1,
                thumbnail: "$thumbnail.thumbnail"
            }
        }

    ])

    if (!playlist) {
        throw new apiError("Playlist not found")
    }

    res
        .status(200)
        .json(new apiResponse(200, playlist, "Playlist Fatched Successfully"))

})



const getPlaylistDetails = asyncHandler(async (req, res) => {

    const playlistId = req.body._id

    if (!playlistId) {
        throw new apiError("Playlist not found")
    }


    const playlistDetails = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: "$videos"
            }
        }
    ]);

    if (!playlistDetails) {
        throw new apiError(401, "Playlist details not found")
    }

    res
        .status(200)
        .json(new apiResponse(200, playlistDetails, "Playlist Details featched Successfully"))

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { _id, video } = req.body
    const userId = req.user._id

    try {


        const addToPlaylist = await Playlist.aggregate([
            {
                _id: new mongoose.Types.ObjectId(_id),
                owner: new mongoose.Types.ObjectId(userId)
            },
            {
                $set: {
                    videos: {
                        $setUnion: ["$videos", [new mongoose.Types.ObjectId(video)]]
                    }
                }
            },
            {
                $merge: {
                    into: "playlists",                      // Commits the update
                    whenMatched: "merge"
                }
            },
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    videos: "$videos"
                }
            }

        ])

        if (!addToPlaylist) {
            throw new apiError(401, "Failed to Add video to Playlist ")
        }

        res
            .status(200)
            .json(new apiResponse(200, addToPlaylist, "Playlist Added Successfully"))
    }
    catch (error) {
        throw new apiError(402, `Failed to Add video in Playlist \n ${error}`)
    }

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { _id, video } = req.body
    const user = req.user
    try {

        const removeVideo = await Playlist.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                    owner: new mongoose.Types.ObjectId(user),
                }
            },
            {
                $pull: { videos: new mongoose.Types.ObjectId(video) }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    videos: 1
                }
            }
        ])

        if (!removeVideo) {
            throw new apiError(401, "Somthing Went Wrong Db Error")
        }

        res
            .status(200)
            .json(new apiResponse(200, removeVideo, "Video Remove Successfully"))

    } catch (error) {
        throw new apiError(404, `Somthing Went Wrong ${error} `)
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const _id = req.body._id
    const user = req.user._id

    const deletePlaylist = await Playlist.deleteOne(
        {
            _id: _id,
            owner: user
        }
    )

    if (!deletePlaylist) {
        throw new apiError(404, `Playlist can't be Deleted`)
    }

    res
        .status(200)
        .json(new apiResponse(200, {}, "Playlist Deleted Successfully"))


})

export{
    createPlaylist,
    getAllPlaylist,
    getPlaylistDetails,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist

}