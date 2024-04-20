const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadOnCloudinary = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/user.model");

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

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
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
  const user = await userModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

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
  //send response

  console.log("Called");

  const avatarLocalPath = req.files?.avatar[0].path;

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

  user.avatar = avatarCloudinaryUrl?.url;
  await user.save({ validateBeforeSave: false });

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
  //if upload is not successful then throw error
  //return response

  const coverImageLocalPath = req?.files?.coverImage[0].path;

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

  user.coverImage = coverImageCloudinaryUrl?.url;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully!!"));
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
};
