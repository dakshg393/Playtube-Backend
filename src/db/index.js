import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
import dotenv from 'dotenv'


dotenv.config()

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`\n mongodb Connected !! DB Host : ${connectionInstance.connection.host}`)
    }catch (error){
        console.log("Mongodb connection error ", error)
        process.exit(1)
    }
}

export default connectDB