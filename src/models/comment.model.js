import mongoose, { Schema, Types } from "mongoose";

const comment = new Schema({
    content:{
        type:String,
        require:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment",comment)