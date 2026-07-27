/**
 Copyright (C) 2026
 Licensed under the  GPL-3.0 License;
 You may not use this file except in compliance with the License.
 It is supplied in the hope that it may be useful.
 * @project_name : Empire-Md
 * @author : efeurhobobullish <https://github.com/efeurhobobullish>
 * @description : Empire-Md ,A Multi-functional whatsapp bot.
 * @version 0.0.2
 **/
 
const fs = require("fs");
const path = require("path");
const os = require("os");
const Crypto = require("crypto");
const webp = require("node-webpmux");
const sharp = require("sharp");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const ff = require("fluent-ffmpeg");

ff.setFfmpegPath(ffmpegPath);

/* ===== ROOT TEMP FOLDER ===== */

const ROOT_DIR = path.resolve(__dirname, "../../");
const TEMP_DIR = path.join(ROOT_DIR, "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/* ============================== */
/*         WEBP → MP4            */
/* ============================== */

async function webp2mp4(buffer) {
  const tempDir = path.join(TEMP_DIR, `webp_frames_${Date.now()}`);
  const outputPath = path.join(TEMP_DIR, `output_${Date.now()}.mp4`);

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });

    const metadata = await sharp(buffer, { animated: true }).metadata();

    if (!metadata.pages || metadata.pages === 1) {
      const pngBuffer = await sharp(buffer).png().toBuffer();
      await fs.promises.writeFile(
        path.join(tempDir, "frame_001.png"),
        pngBuffer
      );
    } else {
      for (let i = 0; i < metadata.pages; i++) {
        const frameBuffer = await sharp(buffer, { page: i })
          .png()
          .toBuffer();

        await fs.promises.writeFile(
          path.join(tempDir, `frame_${String(i + 1).padStart(3, "0")}.png`),
          frameBuffer
        );
      }
    }

    await new Promise((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegPath, [
        "-y",
        "-framerate",
        "30",
        "-i",
        path.join(tempDir, "frame_%03d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        outputPath,
      ]);

      ffmpegProcess.on("error", reject);
      ffmpegProcess.on("close", code =>
        code !== 0 ? reject(new Error("FFmpeg failed")) : resolve()
      );
    });

    const result = await fs.promises.readFile(outputPath);

    await fs.promises.rm(tempDir, { recursive: true, force: true });
    await fs.promises.unlink(outputPath);

    return result;
  } catch (error) {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    await fs.promises.unlink(outputPath).catch(() => {});
    throw error;
  }
}

/* ============================== */
/*         IMAGE → WEBP          */
/* ============================== */

async function imageToWebp(media) {
  const tmpIn = path.join(TEMP_DIR, `${Date.now()}.jpg`);
  const tmpOut = path.join(TEMP_DIR, `${Date.now()}.webp`);

  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on("error", reject)
      .on("end", resolve)
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
      ])
      .toFormat("webp")
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);

  return buff;
}

/* ============================== */
/*         VIDEO → WEBP          */
/* ============================== */

async function videoToWebp(media) {
  const tmpIn = path.join(TEMP_DIR, `${Date.now()}.mp4`);
  const tmpOut = path.join(TEMP_DIR, `${Date.now()}.webp`);

  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on("error", reject)
      .on("end", resolve)
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale=512:512:force_original_aspect_ratio=decrease,fps=12",
        "-loop",
        "0",
        "-t",
        "6",
        "-preset",
        "picture",
        "-an",
      ])
      .toFormat("webp")
      .save(tmpOut);
  });

  const buffer = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);

  return buffer;
}

/* ============================== */
/*          WRITE EXIF           */
/* ============================== */

async function writeExifWebp(media, metadata) {
  const tmpIn = path.join(TEMP_DIR, `${Date.now()}_in.webp`);
  const tmpOut = path.join(TEMP_DIR, `${Date.now()}_out.webp`);

  fs.writeFileSync(tmpIn, media);

  const img = new webp.Image();
  await img.load(tmpIn);
  fs.unlinkSync(tmpIn);

  const json = {
    "sticker-pack-id": `com.empire.sticker.${Date.now()}`,
    "sticker-pack-name": metadata.packname || "Empire_Md",
    "sticker-pack-publisher": metadata.author || "Empire Tech",
    emojis: metadata.categories || ["🙂"],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57,
    0x07, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x16, 0x00,
    0x00, 0x00,
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);

  exif.writeUIntLE(jsonBuff.length, 14, 4);
  img.exif = exif;

  await img.save(tmpOut);

  return tmpOut;
}

async function writeExifImg(media, metadata) {
  const wMedia = await imageToWebp(media);
  return writeExifWebp(wMedia, metadata);
}

async function writeExifVid(media, metadata) {
  const wMedia = await videoToWebp(media);
  return writeExifWebp(wMedia, metadata);
}

module.exports = {
  imageToWebp,
  webp2mp4,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp,
};