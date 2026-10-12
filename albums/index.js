// 此文件由 `npm run albums:sync` 自动生成，请勿手动编辑。
import album0 from "./autumn-notes/album.js";
import album1 from "./rainy-morning/album.js";
import album2 from "./sea-breeze/album.js";

export default [album0, album1, album2]
  .sort((left, right) => left.number.localeCompare(right.number, undefined, { numeric: true }));
