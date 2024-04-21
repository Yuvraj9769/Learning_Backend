const authMiddleWarejwt = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.use(authMiddleWarejwt);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

module.exports = router;
