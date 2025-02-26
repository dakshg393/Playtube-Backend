import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "./cloudinary.js";
import fs from 'fs'
import ytdl from "@distube/ytdl-core";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";

 //to calculate video durarion


ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

const downloadVideo = async (videourl,outputPath="../../public/temp/video.mp4") =>{
  
  try {
    console.log("dawonloding start")
    const videoStream = ytdl(videourl, {
      quality: "lowestvideo",
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
    });     //recive data in chunks 
    const writeStream = fs.createWriteStream(outputPath); //crete a path to write file in local system
    videoStream.pipe(writeStream);  //merge all chunks and wirte one file


    await new Promise((resolve,reject)=>{
      writeStream.on("finish",()=>{
        console.log("downloding complete")
        resolve()
        return outputPath
      })
      
      writeStream.on("error",reject)
    })

    return outputPath

  } catch (error) {
    console.log("Error in dowonloding video")
    throw error
  }
}

async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject("Error fetching video duration: " + err);
      } else {
        resolve(metadata.format.duration); // Returns duration in seconds
      }
    });
  });
}


const compressVideo = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264")  // H.264 codec for good compression
      .audioCodec("aac")  // Compress audio as well
      .size("640x?")  // Reduce resolution to 640px width (or lower)
      .outputOptions([
        "-preset veryslow", // Better compression (slower but smaller file)
        "-crf 30", // Increase compression (higher = smaller size, lower = better quality)
        "-b:v 500k", // Reduce bitrate (lower = smaller size)
      ])
      .on("end", () => {
        console.log("Compression complete:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("Compression error:", err);
        reject(err);
      })
      .run();
  });
};



async function fetchVideos(query, category) {
  
  
    const apiKey = process.env.YOUTUBE_API_KEY;
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        maxResults: 5, // Fetch 20 videos per category
        q: query,
        type: "video",
        key: apiKey,
      },
    });

    for (const item of response.data.items) {
      try {
        // Download the YouTube video
        const downloadedFilePath = await downloadVideo(
          `https://www.youtube.com/watch?v=${item.id.videoId}`,
          `./public/temp/${item.id.videoId}.mp4`
        );
         

        const localPath = downloadedFilePath.replace(/\.mp4$/, "_compressed.mp4");//compress before upload

        const compressedFilePath = await compressVideo(downloadedFilePath,localPath)
        console.log(`compressed file is your ${compressedFilePath}`)
        console.log("file compressed successfully")

        const videoduration = await getVideoDuration(compressedFilePath)
        // Upload video to Cloudinary
        console.log("Succefully gating video durattion")
        console.log("upload on cloudnary")
        const cloudUrl = await uploadOnCloudinary(compressedFilePath,"playtube/videos");
        console.log("Successfully  upload")
        // Create video data object
        const videoData = {
          videoFile: cloudUrl.playback_url, // Cloudinary uploaded file URL
          thumbnail: item.snippet.thumbnails.high.url,
          title: item.snippet.title,
          description: item.snippet.description,
          duration: videoduration, // 
          category: category, // Ensure valid category
          views: Math.floor(Math.random() * 1000000), // Fake views count
          owner: new mongoose.Types.ObjectId("67bf1ccfe4c7a2425f1c2fe2"), // Assign random user
        };
        console.log("video data created now save in mongo")
        // Insert video data into MongoDB
        await Video.create(videoData);
        console.log(`✅ Inserted video: ${item.snippet.title}`);
      } catch (error) {
        console.error(`❌ Error processing video ${item.snippet.title}:`, error);
      }
    }
    
}
// Run function for different categories
async function populateDatabase() {
  const categories = [
    { query: "latest technology news", category: "Technology" },
    { query: "gaming highlights", category: "Gaming" },
    { query: "best travel destinations", category: "Travel" },
    { query: "popular music hits", category: "Music" },
    { query: "educational tutorials", category: "Education" },
    { query: "sports news highlights", category: "Sports" },
  ];

  for (const { query, category } of categories) {
    await fetchVideos(query, category);
  }

  mongoose.connection.close();
}

export {populateDatabase}












