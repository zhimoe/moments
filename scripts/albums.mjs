#!/usr/bin/env node

import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const albumsDirectory = path.join(root, "albums");
const indexFile = path.join(albumsDirectory, "index.js");
const sourceExtensions = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"]);
const rawExtensions = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".heic", ".heif"]);
const orientations = new Set(["landscape", "portrait", "square"]);

function fail(message) {
  console.error(`\n错误：${message}\n`);
  process.exitCode = 1;
}

function usage() {
  console.log(`相册维护工具

用法：
  npm run album:create -- <album-id> [照片目录]
  npm run albums:sync
  npm run albums:check

示例：
  npm run album:create -- summer-2026 ~/Pictures/summer-2026

album-id 只能包含小写字母、数字和连字符。JPG、PNG、TIFF 会通过 cwebp
转为 WebP；已有 WebP 会直接复制。创建出的说明字段故意留空，补全 album.js
并通过 albums:check 后才可提交。`);
}

async function albumFolders() {
  await mkdir(albumsDirectory, { recursive: true });
  const entries = await readdir(albumsDirectory, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const config = path.join(albumsDirectory, entry.name, "album.js");
    try {
      if ((await stat(config)).isFile()) folders.push(entry.name);
    } catch {
      // A folder without album.js is reported by check(), not included in the index.
    }
  }

  return folders.sort((left, right) => left.localeCompare(right));
}

function renderIndex(folders) {
  const imports = folders
    .map((folder, index) => `import album${index} from ${JSON.stringify(`./${folder}/album.js`)};`)
    .join("\n");
  const names = folders.map((_, index) => `album${index}`).join(", ");

  return `// 此文件由 \`npm run albums:sync\` 自动生成，请勿手动编辑。\n${imports}\n\nexport default [${names}]\n  .sort((left, right) => left.number.localeCompare(right.number, undefined, { numeric: true }));\n`;
}

async function sync({ quiet = false } = {}) {
  const folders = await albumFolders();
  await writeFile(indexFile, renderIndex(folders), "utf8");
  if (!quiet) console.log(`已更新 albums/index.js（${folders.length} 册相册）。`);
}

function commandExists(command) {
  const result = spawnSync(command, ["-version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

function readWebpDimensions(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("不是有效的 WebP 文件");
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;

    if (type === "VP8X" && data + 10 <= buffer.length) {
      return {
        width: buffer.readUIntLE(data + 4, 3) + 1,
        height: buffer.readUIntLE(data + 7, 3) + 1
      };
    }
    if (type === "VP8 " && data + 10 <= buffer.length) {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff
      };
    }
    if (type === "VP8L" && data + 5 <= buffer.length && buffer[data] === 0x2f) {
      return {
        width: 1 + buffer[data + 1] + ((buffer[data + 2] & 0x3f) << 8),
        height: 1 + (buffer[data + 2] >> 6) + (buffer[data + 3] << 2) + ((buffer[data + 4] & 0x0f) << 10)
      };
    }

    offset = data + size + (size % 2);
  }

  throw new Error("无法读取 WebP 尺寸");
}

function orientationFor({ width, height }) {
  const ratio = width / height;
  if (ratio >= 0.9 && ratio <= 1.1) return "square";
  return ratio > 1 ? "landscape" : "portrait";
}

function outputName(filename) {
  return `${path.basename(filename, path.extname(filename))}.webp`;
}

function renderAlbum(id, photos) {
  const photoEntries = photos.map(({ filename, orientation }) => `    {
      src: photo(${JSON.stringify(filename)}),
      orientation: ${JSON.stringify(orientation)},
      alt: "",
      caption: "",
      meta: ""
    }`).join(",\n");
  const cover = photos.length > 0 ? `photo(${JSON.stringify(photos[0].filename)})` : '""';

  return `const photo = (name) => new URL(name, import.meta.url).href;

export default {
  id: ${JSON.stringify(id)},
  number: "",
  title: "",
  subtitle: "",
  date: "",
  tone: "",
  cover: ${cover},
  intro: "",
  photos: [
${photoEntries}
  ]
};
`;
}

async function create(id, sourceArgument) {
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error("请提供合法的 album-id（例如 summer-2026）");
  }

  const destination = path.join(albumsDirectory, id);
  try {
    await stat(destination);
    throw new Error(`albums/${id} 已存在，未覆盖任何文件`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  let sourceFiles = [];
  let sourceDirectory = null;
  if (sourceArgument) {
    sourceDirectory = path.resolve(sourceArgument);
    const sourceStat = await stat(sourceDirectory).catch(() => null);
    if (!sourceStat?.isDirectory()) throw new Error(`照片目录不存在：${sourceDirectory}`);
    sourceFiles = (await readdir(sourceDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && sourceExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
    if (sourceFiles.length === 0) throw new Error("照片目录中没有支持的 JPG、PNG、TIFF 或 WebP 文件");
  }

  const needsConversion = sourceFiles.some((filename) => path.extname(filename).toLowerCase() !== ".webp");
  if (needsConversion && !commandExists("cwebp")) {
    throw new Error("未找到 cwebp。macOS 请先运行 `brew install webp`，然后重试");
  }

  const outputNames = sourceFiles.map(outputName);
  const duplicate = outputNames.find((name, index) => outputNames.indexOf(name) !== index);
  if (duplicate) throw new Error(`转换后会产生重名文件：${duplicate}`);

  const temporary = path.join(albumsDirectory, `.${id}.creating-${process.pid}`);
  await mkdir(temporary, { recursive: false });

  try {
    const photos = [];
    for (let index = 0; index < sourceFiles.length; index += 1) {
      const inputName = sourceFiles[index];
      const output = outputNames[index];
      const inputPath = path.join(sourceDirectory, inputName);
      const outputPath = path.join(temporary, output);

      if (path.extname(inputName).toLowerCase() === ".webp") {
        await copyFile(inputPath, outputPath);
      } else {
        const result = spawnSync("cwebp", ["-quiet", "-q", "84", "-metadata", "none", inputPath, "-o", outputPath], {
          stdio: "inherit"
        });
        if (result.error || result.status !== 0) throw new Error(`转换失败：${inputName}`);
      }

      const dimensions = readWebpDimensions(await readFile(outputPath));
      photos.push({ filename: output, orientation: orientationFor(dimensions) });
      console.log(`  ${inputName} → ${output} (${dimensions.width}×${dimensions.height})`);
    }

    await writeFile(path.join(temporary, "album.js"), renderAlbum(id, photos), "utf8");
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }

  await sync({ quiet: true });
  console.log(`\n已创建 albums/${id}/ 并更新索引。`);
  console.log(`请填写 albums/${id}/album.js 中所有空字段，再运行 npm run albums:check。`);
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function imageSource(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "file:") return { kind: "local", path: fileURLToPath(url) };
    if (url.protocol === "https:" || url.protocol === "http:") return { kind: "remote", url };
    return null;
  } catch {
    return null;
  }
}

async function check() {
  const errors = [];
  const entries = await readdir(albumsDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const configStat = await stat(path.join(albumsDirectory, entry.name, "album.js")).catch(() => null);
    if (!configStat?.isFile()) errors.push(`albums/${entry.name}/ 缺少 album.js`);
  }

  const folders = await albumFolders();
  if (folders.length === 0) errors.push("albums/ 中没有相册");

  const expectedIndex = renderIndex(folders);
  const actualIndex = await readFile(indexFile, "utf8").catch(() => "");
  if (actualIndex !== expectedIndex) errors.push("albums/index.js 未同步，请运行 npm run albums:sync");

  const ids = new Set();
  const numbers = new Set();
  for (const folder of folders) {
    const albumDirectory = path.join(albumsDirectory, folder);
    const relativeConfig = `albums/${folder}/album.js`;
    let album;
    try {
      const moduleUrl = `${pathToFileURL(path.join(albumsDirectory, folder, "album.js")).href}?check=${Date.now()}`;
      album = (await import(moduleUrl)).default;
    } catch (error) {
      errors.push(`${relativeConfig} 无法加载：${error.message}`);
      continue;
    }

    if (!album || typeof album !== "object") {
      errors.push(`${relativeConfig} 必须 default export 一个相册对象`);
      continue;
    }

    for (const field of ["id", "number", "title", "subtitle", "date", "tone", "cover", "intro"]) {
      if (isBlank(album[field])) errors.push(`${relativeConfig}: ${field} 不能为空`);
    }
    if (album.id !== folder) errors.push(`${relativeConfig}: id 必须与目录名 ${JSON.stringify(folder)} 一致`);
    if (album.id && ids.has(album.id)) errors.push(`${relativeConfig}: id ${JSON.stringify(album.id)} 重复`);
    if (album.number && numbers.has(album.number)) errors.push(`${relativeConfig}: number ${JSON.stringify(album.number)} 重复`);
    if (album.id) ids.add(album.id);
    if (album.number) numbers.add(album.number);

    const coverSource = imageSource(album.cover);
    if (album.cover && !coverSource) {
      errors.push(`${relativeConfig}: cover 必须是 photo(...) 或 http(s) URL`);
    } else if (coverSource?.kind === "local" && !(await stat(coverSource.path).catch(() => null))?.isFile()) {
      errors.push(`${relativeConfig}: cover 指向的本地文件不存在`);
    } else if (coverSource?.kind === "local" && path.dirname(coverSource.path) !== albumDirectory) {
      errors.push(`${relativeConfig}: cover 的本地图片必须放在本相册目录中`);
    } else if (coverSource?.kind === "local" && path.extname(coverSource.path).toLowerCase() !== ".webp") {
      errors.push(`${relativeConfig}: cover 的本地图片必须是 WebP`);
    }

    if (!Array.isArray(album.photos) || album.photos.length === 0) {
      errors.push(`${relativeConfig}: photos 至少需要一张照片`);
      continue;
    }

    const listedFiles = new Set();
    for (let index = 0; index < album.photos.length; index += 1) {
      const photo = album.photos[index];
      const label = `${relativeConfig}: photos[${index}]`;
      for (const field of ["src", "orientation", "alt", "caption", "meta"]) {
        if (isBlank(photo?.[field])) errors.push(`${label}.${field} 不能为空`);
      }
      if (photo?.orientation && !orientations.has(photo.orientation)) {
        errors.push(`${label}.orientation 只能是 landscape、portrait 或 square`);
      }
      const source = imageSource(photo?.src);
      const photoPath = source?.kind === "local" ? source.path : null;
      if (photoPath) listedFiles.add(path.basename(photoPath));
      if (photo?.src && !source) {
        errors.push(`${label}.src 必须是 photo(...) 或 http(s) URL`);
      } else if (photoPath && !(await stat(photoPath).catch(() => null))?.isFile()) {
        errors.push(`${label}.src 指向的本地文件不存在`);
      } else if (photoPath && path.dirname(photoPath) !== albumDirectory) {
        errors.push(`${label}.src 的本地图片必须放在本相册目录中`);
      }
      if (photoPath && path.extname(photoPath).toLowerCase() !== ".webp") {
        errors.push(`${label}.src 不是 WebP 文件`);
      }
    }

    const files = await readdir(albumDirectory, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) continue;
      const extension = path.extname(file.name).toLowerCase();
      if (rawExtensions.has(extension)) errors.push(`${relativeConfig}: 请转换或移走原图 ${file.name}`);
      if (extension === ".webp" && !listedFiles.has(file.name)) {
        errors.push(`${relativeConfig}: ${file.name} 尚未加入 photos`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("相册检查未通过：\n");
    for (const error of errors) console.error(`- ${error}`);
    throw new Error(`共发现 ${errors.length} 个问题`);
  }

  console.log(`相册检查通过：${folders.length} 册，说明字段和照片文件均完整。`);
}

const [command, ...args] = process.argv.slice(2);

try {
  if (command === "create") await create(args[0], args[1]);
  else if (command === "sync") await sync();
  else if (command === "check") await check();
  else {
    usage();
    if (command && command !== "help" && command !== "--help" && command !== "-h") process.exitCode = 1;
  }
} catch (error) {
  fail(error.message);
}
