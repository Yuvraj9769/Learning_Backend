const asyncHandler = require("../utils/asyncHandler");

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

module.exports = {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
