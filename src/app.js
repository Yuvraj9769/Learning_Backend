const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public")); // to store data on server
app.use(cookieParser());

//routes  require
const userRouter = require("./routes/user.routes");
const videoRouter = require("./routes/video.routes");
const tweetRouter = require("./routes/tweet.routes");
const subscriptionRouter = require("./routes/subscriptions.routes");
const commentRouter = require("./routes/comment.routes");
const likeRouter = require("./routes/like.routes");
const playlistRouter = require("./routes/playlist.routes");
const dashboardRouter = require("./routes/dashboard.routes");

//routes  declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

module.exports = app;
