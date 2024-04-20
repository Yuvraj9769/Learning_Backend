const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("Response = ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation is failed
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    const { result } = await cloudinary.uploader.destroy(publicId); //return {result: "ok"}
    return result;
  } catch (error) {
    console.log("Error while deleting file : ", error);
    return null;
  }
};

const getPublicId = (Imagecloudinaryurl) => {
  try {
    const publicId = Imagecloudinaryurl.split("/res.cloudinary.com/")[1]
      .split("/")[4]
      .split(".png")[0];
    return publicId;
  } catch (error) {
    console.log("Error while getting public id");
    return null;
  }
};

module.exports = { uploadOnCloudinary, deleteOnCloudinary, getPublicId };
