const { uploadVideo } = require("../controllers/video.controller");
const authMiddleWarejwt = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

const router = require("express").Router();

router
  .route("/uploadVideo")
  .post(authMiddleWarejwt, upload.single("video"), uploadVideo);

module.exports = router;
