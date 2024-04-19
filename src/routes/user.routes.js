const {
  registerUser,
  getUserData,
  logoutUser,
  loginUser,
  refreshAccessToken,
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

router.route("/data").get(getUserData);

//secured routes : -
router.route("/logout").get(authMiddleWarejwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

module.exports = router;
