const asynHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const uploadOnCloudinary = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");

const registerUser = asynHandler(async (req, res) => {
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

  const { fullName, username, email, avatar, coverImage, password } = req.body;

  if (
    [fullName, username, email, avatar, coverImage, password].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist!!");
  }
  const avatarLocalPath = req.files?.avatar[0].path; // multer middle ware provide req.file options
  const coverImageLocalPath = req.files?.coverImage[0].path; // multer middle ware provide req.file options
  console.log(req.files);
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarRes = await uploadOnCloudinary(avatarLocalPath);
  const coverImageRes = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarRes) {
    throw new ApiError(400, "Avatar file is required");
  }

  const User = await User.create({
    fullName,
    avatar: avatarRes.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(User._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully!!"));
});

module.exports = { registerUser };
