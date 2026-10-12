const photo = (name) => new URL(name, import.meta.url).href;

export default {
  id: "rainy-morning",
  number: "03",
  title: "雨天早餐",
  subtitle: "窗外下着雨，桌边是慢慢醒来的早晨",
  date: "2026 · SPRING",
  tone: "clay",
  cover: photo("rainy-breakfast.webp"),
  intro: "有时值得留下来的，并不是远方，而是一顿不用赶时间的早餐。窗上的雨、剥开的橘子，还有坐在一起的片刻。",
  photos: [
    {
      src: photo("rainy-breakfast.webp"),
      orientation: "landscape",
      alt: "雨天窗边的家庭早餐桌",
      caption: "雨没有停，早餐就吃得慢一些。",
      meta: "四月 · 家中"
    }
  ]
};
