// Example filename: index.js

const fs = require("fs");
const { Deepgram } = require("@deepgram/sdk");
require('dotenv').config();

const deepgramApiKey = process.env.deepgramApiKey;

async function transcribe(filename) {
    let result;
    const file = filename
    const mimetype = "audio/mp3";
    const deepgram = new Deepgram(deepgramApiKey);
 
    const audio = fs.readFileSync(file);
        source = {
        buffer: audio,
        mimetype: mimetype,
        };

    return new Promise((resolve, reject) => {
        deepgram.transcription
            .preRecorded(source, {
                smart_format: true,
                model: "nova",
                })
            .then((response) => {
                result =  response.results.channels[0].alternatives[0].words;
                resolve(result)
                })
            .catch((err) => {
            reject(err)
        });
        });
        
}

module.exports = transcribe