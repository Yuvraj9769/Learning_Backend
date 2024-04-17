const mongoose = require("mongoose");
const { DB_NAME } = require("../constatnts.js");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log("MongoDB connected!!");
  } catch (err) {
    console.log("Mongodb connection error: ", err);
    process.exit(1);
  }
};

module.exports = connectDB;
