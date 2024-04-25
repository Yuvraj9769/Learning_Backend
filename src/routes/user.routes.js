const {
  registerUser,
  getUserData,
  logoutUser,
  loginUser,
  refreshAccessToken,
  updateUser,
  changeCurrentPassword,
  getUserProfile,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getUploadedVideos,
} = require("../controllers/user.controller");
const authMiddleWarejwt = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");
const express = require("express");
const router = express.Router();

router.route("/register").post(
  upload.fields([
    // will save on server
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes : -
router.route("/logout").get(authMiddleWarejwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/data").get(authMiddleWarejwt, getUserData);
router.route("/profile").get(authMiddleWarejwt, getUserProfile);
router.route("/update/:uname").patch(authMiddleWarejwt, updateUser);
router.route("/changePassword").patch(authMiddleWarejwt, changeCurrentPassword);
router
  .route("/updateAvatar")
  .patch(authMiddleWarejwt, upload.single("avatar"), updateUserAvatar);

router
  .route("/updateCoverImage")
  .patch(authMiddleWarejwt, upload.single("coverImage"), updateCoverImage);

router
  .route("/getUserChannelProfile/:username")
  .get(authMiddleWarejwt, getUserChannelProfile);

router.route("/History").get(authMiddleWarejwt, getWatchHistory);
router.route("/YourVideos").get(authMiddleWarejwt, getUploadedVideos);

module.exports = router;
