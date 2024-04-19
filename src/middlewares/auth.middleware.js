const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const userModel = require("../models/user.model");

const authMiddleWarejwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorizatoin").replace("Bearer ", "");
    if (!token) {
      throw new ApiError(
        401,
        "Unauthorized request \n Please Login or Signup first"
      );
    }
    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel
      .findById(decodedData?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(500, "Invalid Token");
  }
});

module.exports = authMiddleWarejwt;
