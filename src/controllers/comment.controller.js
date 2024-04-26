const { default: mongoose } = require("mongoose");
const commentModel = require("../models/comment.model");
const videoModel = require("../models/video.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video

  const videoComment = await commentModel.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(req?.params?.videoId),
      },
    },
    {
      $project: {
        content: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videoComment, "Comment fetched successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const videoComment = await commentModel.findByIdAndUpdate(
    req?.params?.commentId,
    {
      $set: {
        content: req?.body?.content,
      },
    },
    {
      new: true,
    }
  );

  if (!videoComment) {
    throw new ApiError(400, "Invalid Comment Id or comment does not exist!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const deleteCommentData = await commentModel.findByIdAndDelete(
    req?.params?.commentId
  );

  if (!deleteCommentData) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteCommentData, "Comment deleted successfully")
    );
});

module.exports = {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
