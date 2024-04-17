const asynHandler = require("../utils/asyncHandler");

const registerUser = asynHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

module.exports = { registerUser };
