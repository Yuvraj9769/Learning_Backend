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
router.route("/update/:uname").put(authMiddleWarejwt, updateUser);
router.route("/changePassword").put(authMiddleWarejwt, changeCurrentPassword);
router
  .route("/updateAvatar")
  .put(
    authMiddleWarejwt,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateUserAvatar
  );

router
  .route("/updateCoverImage")
  .put(
    authMiddleWarejwt,
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    updateCoverImage
  );

module.exports = router;
