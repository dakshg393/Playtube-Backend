import mongoose, { Schema } from "mongoose";


const likeSchema = new Schema({
    type: {
        type: String,
        enums: ["Comment","Video","Tweet"],
        require:true
    },
    contentId: {
        type: Schema.Types.ObjectId,
        refPath: 'type',
        require:true
    },

   
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require:true
    }
},{timestamps:true})

likeSchema.index({ likedBy: 1, contentId: 1, type: 1 }, { unique: true });


export const Like = mongoose.model("Like",likeSchema)