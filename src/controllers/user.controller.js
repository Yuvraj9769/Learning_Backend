const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const {
  uploadOnCloudinary,
  deleteOnCloudinary,
  getPublicId,
} = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/user.model");
const { default: mongoose } = require("mongoose");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await userModel.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user data from frontend
  //validation - not empty
  //check if user already exist  -  username,email
  //check for images
  //check for avatar
  //upload then to cloudinary
  //create user object
  //create entry in db
  //remove password and refresh token from response
  //check response
  //return response

  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!!");
  }

  const existedUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist!!");
  }
  const avatarLocalPath = req.files?.avatar[0].path; // multer middle ware provide req.file options
  // console.log("req.file = ", req.files);
  // console.log("Avatar Local Path = ", avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required1");
  }

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatarRes = await uploadOnCloudinary(avatarLocalPath);
  // console.log("Avatar cloudinary url = ", avatarRes);
  const coverImageRes = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarRes) {
    throw new ApiError(400, "Avatar file is required2");
  }

  const User = await userModel.create({
    fullName,
    avatar: avatarRes.url,
    coverImage: coverImageRes?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await userModel
    .findByIdAndUpdate(User._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    createdUser._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, createdUser, "User registered Successfully!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get data
  //check username and email is there?
  //user find
  //check password is correct?
  //if correct generate refresh and access token
  //send in cookies
  //login successfully

  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "User name and email is required.");
  }

  let regUserName = new RegExp(username, "i");

  const user = await userModel.findOne({
    $or: [{ username: regUserName }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User not found.");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid Password!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // const user = await userModel.findById(req.user?._id);
  const user = await userModel.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, //this removes the refreshToken field from the user document
      },
    },
    {
      new: true,
    }
  );

  //or : -

  // user.refreshToken = undefined;
  // await user.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, user, "User logout successfully"));
});

const getUserData = asyncHandler(async (req, res) => {
  const data = await userModel.find();
  res.status(200).json(data);
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req?.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unathorized request");
  }

  const user = await userModel.findById(incomingRefreshToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid or Expired token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid or Expired token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, null, "New Refresh token added"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { uname } = req.params;

  const user = await userModel.findOne({ username: uname });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { username } = req.body;

  if (!username) {
    throw new ApiError(401, "Username required to update!!");
  }

  const updateUser = await userModel.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        username,
      },
    },
    {
      new: true,
    }
  );

  if (!updateUser) {
    throw new ApiError(500, "Issue While updating the user");
  }

  return res.status(200).json(
    new ApiResponse(201, {
      updateUser,
    })
  );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get old and new password from req.body
  //check user is exist?
  //if exist then verify its password
  //if matches then update the password
  //else throw error

  const { oldPassword, newPassword } = req.body;

  if (oldPassword === newPassword) {
    throw new ApiError(
      401,
      "Old and new Password is same please change new password to update!!"
    );
  }

  const user = await userModel.findById(req?.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized request!!");
  }

  const isMatch = await user.isPasswordCorrect(oldPassword);

  if (!isMatch) {
    throw new ApiError(400, "Invalid Password Please enter valid password!!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully!!"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req?.user?._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User Profile"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  //extract avatar path from request
  //find user
  //upload avatar on cloudinary
  //update avatar url to new url
  //get publicId of previous avatar
  //delete previous avatar from cloudinary using that publicId
  //send response

  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required to update!!");
  }

  const user = await userModel
    .findById(req.user?._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "User not found from avatar update");
  }

  const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarCloudinaryUrl) {
    throw new ApiError(500, "Error occur while updating the avatar");
  }

  const avatarPublibId = getPublicId(user?.avatar);

  if (!avatarPublibId) {
    throw new ApiError(500, "Image not found!!");
  }

  user.avatar = avatarCloudinaryUrl?.url;
  await user.save({ validateBeforeSave: false });

  const delImageResponse = await deleteOnCloudinary(avatarPublibId);

  if (delImageResponse !== "ok") {
    throw new ApiError(500, "Error occur while deleting the avatar");
  }

  // const delImageResponse = await deleteOnCloudinary()

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully!!"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  //get file path from req.files
  //find user
  //if user not found then throw error
  //if user exist then upload the file on cloudinary
  //if upload is successful then update the cover image field of user
  //get public id to remove the file from cloudinary
  //delete the file from cloudinary
  //if upload is not successful then throw error
  //return response

  const coverImageLocalPath = req?.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is required to update!!");
  }

  const user = await userModel
    .findById(req?.user?._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found!!");
  }

  const coverImageCloudinaryUrl = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImageCloudinaryUrl) {
    throw new ApiError(500, "Error occured during uploading the coverimage");
  }

  const coverImagePublicId = getPublicId(user?.coverImage);

  if (!coverImagePublicId) {
    throw new ApiError(400, "Image not found!!");
  }

  user.coverImage = coverImageCloudinaryUrl?.url;
  await user.save({ validateBeforeSave: false });

  const delImageResponse = await deleteOnCloudinary(coverImagePublicId);

  if (delImageResponse !== "ok") {
    throw new ApiError(500, "Error occured during deleting the coverImage");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Cover Image updated successfully and previous image is deleted successfully!!"
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req?.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required!!");
  }

  let regUserName = new RegExp(username, "i");

  const channel = await userModel.aggregate([
    {
      $match: {
        username: regUserName,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", //  "subscribers" field will be stored within each document of the user model. The properties or fields included in the "subscribers" field will be determined by the schema of the "subscriptions" collection, not the user model. So, it will contain fields defined in the "subscriptions" model/schema, such as subscriber, channel, and any other fields present in the "subscriptions" collection.
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribedTo: 1,
        subscribers: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "Channel doesnot exist");
  }

  // console.log(channel[0]);

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                //now i am inside in the owner array
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  console.log("User = ", user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0].watchHistory, "User Watch history fetched!!")
    );
});

const getUploadedVideos = asyncHandler(async (req, res) => {
  const user = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "VideoUploaded",
      },
    },
    {
      $addFields: {
        VideoUploaded: {
          $first: "$VideoUploaded",
        },
        No_Of_VideosUploaded: {
          $size: "$VideoUploaded",
        },
      },
    },
  ]);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "Your videos"));
});

module.exports = {
  registerUser,
  getUserData,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUser,
  changeCurrentPassword,
  getUserProfile,
  updateUserAvatar,
  updateCoverImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getUploadedVideos,
};
