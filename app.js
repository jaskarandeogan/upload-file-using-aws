require("dotenv").config();
const express = require("express");
const multer = require("multer"); //
const { s3Uploadv2 } = require("./s3awservice");
const uuid = require("uuid").v4;
const app = express();

const server = app.listen(8080, () => console.log("listening"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//single file upload
// const upload = multer({ dest: "uploads/" });
// app.post("/upload", upload.single("file"),(req, res) => {
//   res.json({ status: "success" });
// });

//multiple file upload
const uploadMultipleFiles = multer({ dest: "uploads/" });
// you can also specify number of files that you want to accept
app.post(
  "/uploadMultipleFiles",
  uploadMultipleFiles.array("file", 2),
  (req, res) => {
    res.json({ status: "success" });
  }
);

// multi field uploads

const uploadMultiple = multer({ dest: "uploads/" });
const multiUpload = uploadMultiple.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

app.post("/uploadMultiple", multiUpload, (req, res) => {
  console.log(req.files);
  res.json({ status: "success" });
});

//multiple file upload with custom name
//for better performance we will not use this method as it will store the image in physical memory; since we dont have to store it in physical memory, we we will store it on cloud.
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // identifier should be same as name in req.files
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

//to store the image instead on cloud. for that we might have to store the image o=on RAM for a moment

const cloudStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] == "image") {
    cb(null, true);
  } else {
    cb(new Error("file is not of correct type", false));
  }
};

const upload = multer({
  cloudStorage,
  fileFilter,
  limits: { fileSize: 1000000, files: 2 },
});
// you can also specify number of files that you want to accept
app.post("/upload", upload.array("file", 2), async (req, res) => {
  const file = req.files;
  try {
    const results = await s3Uploadv2(file);
    res.json({ status: "success", results });
    console.log(results);
  } catch (err) {
    console.log(err);
  }
  // res.json({ status: "success", results });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code == "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }
    if (error.code == "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "file limit reached",
      });
    }
  }
});
