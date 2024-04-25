const commentModel = require("../models/comment.model");
const videoModel = require("../models/video.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // const video = await videoModel.findOne({ videoFile: req.body?.url });
  // if (!video) {
  //   throw new ApiError(400, "Invalid video url");
  // }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const commentData = req.body?.data;

  const video = await videoModel.findOne({ videoFile: req.body?.url });

  if (!video) {
    throw new ApiError(400, "Invalid video url");
  }

  const comment = await commentModel.create({
    content: commentData,
    video: video._id,
    owner: video.owner,
  });

  console.log("comment = ", comment);

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

module.exports = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
