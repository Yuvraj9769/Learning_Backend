const videoModel = require("../models/video.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const uploadVideo = asyncHandler(async (req, res) => {
  const videoLocalPath = req?.file?.path;
  console.log("req file ", req.file);

  if (!videoLocalPath) {
    throw new ApiError(400, "VideoFile is missing");
  }

  const Video = await uploadOnCloudinary(videoLocalPath);

  if (!Video) {
    throw new ApiError(500, "Video uplaoding failed!!");
  }

  console.log("Video url checking = ", Video);

  const videoModelData = {
    ...req.body,
    videoFile: Video?.url,
    duration: Video?.duration,
    isPublished: true,
    owner: req.user._id,
  };

  const uploadedvideo = await videoModel.create(videoModelData);

  console.log(uploadedvideo);

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedvideo, "Video Uploaded Succesfully!!"));
});

module.exports = { uploadVideo };
