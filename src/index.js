require("dotenv").config();
const app = require("./app");
const connectDB = require("./db/index");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server Started!!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
