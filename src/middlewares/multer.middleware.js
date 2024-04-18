const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

module.exports = multer({ storage }); //This is creating a Multer middleware instance with a configuration object. Multer is a Node.js middleware used for handling multipart/form-data, which is primarily used for uploading files.
