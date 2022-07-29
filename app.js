const express = require("express");
const multer = require("multer"); //
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
app.post("/uploadMultipleFiles", uploadMultipleFiles.array("file", 2), (req, res) => {
  res.json({ status: "success" });
});

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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // identifier should be same as name in req.files
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

const upload = multer({ storage });
// you can also specify number of files that you want to accept
app.post("/upload", upload.array("file", 2), (req, res) => {
  res.json({ status: "success" });
});
