import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,  //user who subscribe channel
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,   ///channel to whom user subscribe
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)


