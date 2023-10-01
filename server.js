const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");


const port = process.env.PORT || 3000;



app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

let videoChunks = "";

app.post("/api/video", (req, res) => {
  try {
    const base64Data = req.body.video;
    
    videoChunks += base64Data;
    // Respond with a success message
    res.status(200).json({ message: "Chunk Received" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/assemble", (req, res) => {
  try {
    const title = req.body.title
    const mergedBuffer = Buffer.from(videoChunks, 'base64');
    const filename = `uploaded-${title}-record.webm`;

    const filePath = path.join(__dirname, "uploads", filename); 

    fs.writeFileSync(filePath, mergedBuffer);

    console.log(`Video saved as ${filename}`);
    res.status(200).json({ message: "Video assembled and processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/upload", upload.single("chunk"), (req, res) => {
  try {
    const chunkData = req.file.buffer;
    videoChunks.push(chunkData);

    res.status(200).json({ message: "Chunk received successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.use("/api", upload.single("chunk"), (req, res) => {
  try {
    const body = req.body;
    const file = req.file;
    res.status(200).json({ message: "Video saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
