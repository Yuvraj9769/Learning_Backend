const {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const authMiddleWarejwt = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.use(authMiddleWarejwt);

router.route("/getVideocomments/:videoId").get(getVideoComments);
router.route("/addComment").post(addComment);
router.route("/updateComment/:commentId").patch(updateComment);
router.route("/:commentId").delete(deleteComment);

module.exports = router;
