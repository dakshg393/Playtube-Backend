import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { apiError } from './apiError.js';



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // upload on cloudinery

        const response = await cloudinary.uploader.upload(localFilePath,{resource_type:'auto'})

        fs.unlinkSync(localFilePath)

        console.log("file is successfuly uploded")
        console.log(response)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath)

        // This is a synchronous operation, meaning the file deletion is completed successfully
        // before moving to the next line of execution.
        
        // There is also fs.unlink, which is asynchronous. It starts the file deletion process,
        // but it doesn't wait for the deletion to complete before moving to the next operation.

        return null
    }
}

const deleteOnCloudinery = async (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id)
        return response
    } catch (error) {
        throw new apiError(400,"Error in deleting file")
    }
}

export {uploadOnCloudinary,deleteOnCloudinery}
