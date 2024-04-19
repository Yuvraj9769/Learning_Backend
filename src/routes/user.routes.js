const {
  registerUser,
  getUserData,
  logoutUser,
  loginUser,
  refreshAccessToken,
  updateUser,
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
router.route("/update/:uname").put(authMiddleWarejwt, updateUser);

module.exports = router;
