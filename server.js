
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const transcribe = require("./nova");

const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// url/uploads/videoname.webm
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

let videoChunks = "";

app.post("/api/video", (req, res) => {
  try {
    const base64Data = req.body.video;

    videoChunks += base64Data;
    res.status(200).json({ message: "Chunk Received" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/assemble", async (req, res) => {
  try {
    const title = req.body.title;
    const mergedBuffer = Buffer.from(videoChunks, "base64");
    const filename = `uploaded-${title}-record.webm`;
    const output = `uploads/uploaded-${title}-record.mp3`;
    const filePath = path.join(__dirname, "uploads", filename);
    fs.writeFileSync(filePath, mergedBuffer);
    await convertVideotoAudio(filename,output);
    res.status(200).json({ message: "Video assembled and processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/video/transcription", async (req, res) => {
  const title = req.body.title;
  const audioPath = `uploads/uploaded-${title}-record.mp3`;
  try {
    if (fs.existsSync(audioPath)) {
      const transcription = await transcribe(audioPath); 
      res.status(200).json({ transcription });
    } else {
      res.status(200).json({message: "not available"})
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


async function convertVideotoAudio(input, output) {
  ffmpeg(input)
    .output(output)
    .noVideo()
    .format("mp3")
    .outputOptions("-ab", "192k")
    .run();
}

app.use("/", (req, res) => {
  return res.send({ message: "Server is up and running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
