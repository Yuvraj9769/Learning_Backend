const { registerUser } = require("../controllers/user.controller");
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

module.exports = router;
