const ffmpeg = require("fluent-ffmpeg");
const { randomBytes } = require("crypto");
const fs = require('fs');
const { getHttpStream, toBuffer } = require("@itsliaaa/baileys");
const sharp = require('sharp');
const { spawn } = require("child_process");
const path = require('path');
const { fromBuffer } = require("file-type");
const { tmpdir } = require('os');
const ff = require("fluent-ffmpeg");
const webp = require("node-webpmux");

async function toGif(webpBuffer) {
  try {
    const inputPath = './' + randomBytes(3).toString("hex") + ".webp";
    const outputPath = './' + randomBytes(3).toString('hex') + ".gif";
    fs.writeFileSync(inputPath, webpBuffer.toString('binary'), "binary");
    const convertedPath = await new Promise(resolve => {
      spawn("convert", [inputPath, outputPath]).on("error", error => {
        throw error;
      }).on("exit", () => resolve(outputPath));
    });
    let gifBuffer = fs.readFileSync(convertedPath);
    try {
      fs.unlinkSync(inputPath);
    } catch {}
    try {
      fs.unlinkSync(outputPath);
    } catch {}
    return gifBuffer;
  } catch (error) {
    console.log(error);
  }
}

async function toMp4(gifInput) {
  try {
    let gifPath = './' + randomBytes(3).toString("hex") + ".gif";
    const inputPath = fs.existsSync(gifInput) ? gifInput : save(gifInput, gifPath);
    const outputPath = './' + randomBytes(3).toString("hex") + '.mp4';
    const convertedPath = await new Promise(resolve => {
      ffmpeg(inputPath).outputOptions(["-pix_fmt yuv420p", "-c:v libx264", "-movflags +faststart", "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'"]).toFormat("mp4").noAudio().save(outputPath).on("exit", () => resolve(outputPath));
    });
    let videoBuffer = await fs.promises.readFile(convertedPath);
    try {
      fs.unlinkSync(inputPath);
    } catch {}
    try {
      fs.unlinkSync(outputPath);
    } catch {}
    return videoBuffer;
  } catch (error) {
    console.log(error);
  }
}

const EightD = async audioInput => {
  const inputPath = "./temp/" + randomBytes(3).toString("hex") + '.mp3';
  audioInput = Buffer.isBuffer(audioInput) ? save(audioInput, inputPath) : audioInput;
  const outputPath = "./temp/" + randomBytes(3).toString('hex') + '.mp3';
  const resultPath = await new Promise(resolve => {
    ffmpeg(audioInput).audioFilter(["apulsator=hz=0.125"]).audioFrequency(44100).audioChannels(2).audioBitrate("128k").audioCodec("libmp3lame").audioQuality(5).toFormat("mp3").save(outputPath).on("end", () => resolve(outputPath));
  });
  return resultPath;
};

function save(buffer, filePath = "./temp/saveFile.jpg") {
  try {
    fs.writeFileSync(filePath, buffer.toString("binary"), "binary");
    return filePath;
  } catch (error) {
    console.log(error);
  }
}

const resizeImage = (buffer, width, height) => {
  if (!Buffer.isBuffer(buffer)) {
    throw "Input is not a Buffer";
  }
  return new Promise(async resolve => {
    sharp(buffer).resize(width, height, {
      'fit': "contain"
    }).toBuffer().then(resolve);
  });
};

const _parseInput = async (input, extension = false, returnType = "path") => {
  const buffer = await toBuffer(await getHttpStream(input));
  const tempPath = "./temp/file_" + randomBytes(3).toString('hex') + '.' + (extension ? extension : (await fromBuffer(buffer)).ext);
  const filePath = Buffer.isBuffer(input) ? save(input, tempPath) : fs.existsSync(input) ? input : input;
  if (returnType == "path") {
    return filePath;
  } else {
    if (returnType == "buffer") {
      const fileBuffer = await fs.promises.readFile(filePath);
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {}
      return fileBuffer;
    }
  }
};

async function imageToWebp(imageBuffer) {
  const webpPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  const jpgPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".jpg");
  fs.writeFileSync(jpgPath, imageBuffer);
  await new Promise((resolve, reject) => {
    ff(jpgPath).on("error", reject).on("end", () => resolve(true)).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat("webp").save(webpPath);
  });
  const webpBuffer = fs.readFileSync(webpPath);
  fs.unlinkSync(webpPath);
  fs.unlinkSync(jpgPath);
  return webpBuffer;
}

async function videoToWebp(videoBuffer) {
  const webpPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  const mp4Path = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".mp4");
  fs.writeFileSync(mp4Path, videoBuffer);
  await new Promise((resolve, reject) => {
    ff(mp4Path).on("error", reject).on("end", () => resolve(true)).addOutputOptions(['-vcodec', "libwebp", '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse", "-loop", '0', "-ss", "00:00:00", '-t', "00:00:05", "-preset", "default", "-an", "-vsync", '0']).toFormat("webp").save(webpPath);
  });
  const webpBuffer = fs.readFileSync(webpPath);
  fs.unlinkSync(webpPath);
  fs.unlinkSync(mp4Path);
  return webpBuffer;
}

async function writeExifImg(imageBuffer, metadata) {
  let webpBuffer = await imageToWebp(imageBuffer);
  const inputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + '.webp');
  const outputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  fs.writeFileSync(inputPath, webpBuffer);
  if (metadata.packname || metadata.author) {
    const image = new webp.Image();
    const exifData = {
      'sticker-pack-id': "Aster-Md",
      'sticker-pack-name': metadata.packname,
      'sticker-pack-publisher': metadata.author,
      'emojis': metadata.categories ? metadata.categories : ['']
    };
    const exifHeader = Buffer.from([0x49, 0x49, 0x2a, 0x0, 0x8, 0x0, 0x0, 0x0, 0x1, 0x0, 0x41, 0x57, 0x7, 0x0, 0x0, 0x0, 0x0, 0x0, 0x16, 0x0, 0x0, 0x0]);
    const exifJson = Buffer.from(JSON.stringify(exifData), "utf-8");
    const exifBuffer = Buffer.concat([exifHeader, exifJson]);
    exifBuffer.writeUIntLE(exifJson.length, 14, 4);
    await image.load(inputPath);
    fs.unlinkSync(inputPath);
    image.exif = exifBuffer;
    await image.save(outputPath);
    return outputPath;
  }
}

async function writeExifVid(videoBuffer, metadata) {
  let webpBuffer = await videoToWebp(videoBuffer);
  const inputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  const outputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  fs.writeFileSync(inputPath, webpBuffer);
  let packname;
  let author;
  try {
    packname = metadata.packname;
  } catch (error) {
    packname = "Aster-Md";
  }
  try {
    author = metadata.author;
  } catch (error) {
    author = '';
  }
  const image = new webp.Image();
  const exifData = {
    'sticker-pack-id': 'Aster-Md',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': metadata.categories ? metadata.categories : ['']
  };
  const exifHeader = Buffer.from([0x49, 0x49, 0x2a, 0x0, 0x8, 0x0, 0x0, 0x0, 0x1, 0x0, 0x41, 0x57, 0x7, 0x0, 0x0, 0x0, 0x0, 0x0, 0x16, 0x0, 0x0, 0x0]);
  const exifJson = Buffer.from(JSON.stringify(exifData), "utf-8");
  const exifBuffer = Buffer.concat([exifHeader, exifJson]);
  exifBuffer.writeUIntLE(exifJson.length, 14, 4);
  await image.load(inputPath);
  fs.unlinkSync(inputPath);
  image.exif = exifBuffer;
  await image.save(outputPath);
  return outputPath;
}

async function writeExifWebp(webpBuffer, metadata) {
  const inputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + '.webp');
  const outputPath = path.join(tmpdir(), randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  fs.writeFileSync(inputPath, webpBuffer);
  if (metadata.packname || metadata.author) {
    const image = new webp.Image();
    const exifData = {
      'sticker-pack-id': "",
      'sticker-pack-name': metadata.packname,
      'sticker-pack-publisher': metadata.author,
      'emojis': metadata.categories ? metadata.categories : ['']
    };
    const exifHeader = await Buffer.from([0x49, 0x49, 0x2a, 0x0, 0x8, 0x0, 0x0, 0x0, 0x1, 0x0, 0x41, 0x57, 0x7, 0x0, 0x0, 0x0, 0x0, 0x0, 0x16, 0x0, 0x0, 0x0]);
    const exifJson = await Buffer.from(JSON.stringify(exifData), 'utf-8');
    const exifBuffer = await Buffer.concat([exifHeader, exifJson]);
    await exifBuffer.writeUIntLE(exifJson.length, 14, 4);
    await image.load(inputPath);
    fs.unlinkSync(inputPath);
    image.exif = exifBuffer;
    await image.save(outputPath);
    return outputPath;
  }
}

module.exports = {
  'imageToWebp': imageToWebp,
  'videoToWebp': videoToWebp,
  'writeExifImg': writeExifImg,
  'writeExifVid': writeExifVid,
  'writeExifWebp': writeExifWebp,
  'toGif': toGif,
  'toMp4': toMp4,
  'EightD': EightD,
  '_parseInput': _parseInput,
  'resizeImage': resizeImage
};