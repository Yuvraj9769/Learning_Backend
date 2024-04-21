const authMiddleWarejwt = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.use(authMiddleWarejwt); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

module.exports = router;
