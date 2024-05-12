import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();

// Configure body-parser for URL-encoded and JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())


// Define a simple route
app.get('/get_files', async (req, res) => {
  let r = await scan_files();
  res.send(r)
});
app.get('/audio', async (req, res) => {

  res.sendFile(process.env.audio_path + req.query.f + ".mp3")
});
app.post("/mixer", async (req, res) => {
  let mixer = req.body
  await save_mixer(mixer)
  res.send("saved")
})

app.get("/mixer", async (req, res) => {
  let mixer = await load_mixer()
  //console.log("mixer", mixer)
  res.send(mixer)
})
async function load_mixer() {
  try {
    let mixer = await fs.readFile("mixer.json")
    mixer = JSON.parse(mixer)
    return mixer
  } catch (e) {
    return {}
  }
}
async function save_mixer(mixer) {
  await fs.writeFile("mixer.json", JSON.stringify(mixer))

}
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

async function scan_files() {

  let res_arr = []
  let files = await fs.readdir(process.env.audio_path);
  files.map(f => {
    f = f.replace(".mp3", "")
    if (!f.startsWith("_")) res_arr.push(f)
  })
  return res_arr
}

