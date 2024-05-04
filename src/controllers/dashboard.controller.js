const userModel = require("../models/user.model");
const videoModel = require("../models/video.model");
const asyncHandler = require("../utils/asyncHandler");

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const video = await videoModel.find();

  const videoViews = video.views;
  console.log(videoViews);

  const regUserName = req?.user?.username;

  const videoDetails = await userModel.aggregate([
    {
      $match: {
        usernausername: regUserName,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "Uploaded_Videos",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        Number_Of_Uploaded_Videos: {
          $size: "$Uploaded_Videos",
        },
      },
    },
    {
      $project: {
        subscribersCount: 1,
        isSubscribed: 1,
        username: 1,
        email: 1,
        subscribers: 1,
        Number_Of_Uploaded_Videos: 1,
      },
    },
  ]);
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

module.exports = { getChannelStats, getChannelVideos };
