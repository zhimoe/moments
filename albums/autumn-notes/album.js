const photo = (name) => new URL(name, import.meta.url).href;

export default {
  id: "autumn-notes",
  number: "01",
  title: "秋日小记",
  subtitle: "风经过湖面，也经过我们的周末",
  date: "2026 · AUTUMN",
  tone: "moss",
  cover: photo("lakeside-walk.webp"),
  intro: "天气开始变凉以后，我们把一些慢下来的时刻留了下来。散步、风筝，还有落在毯子上的叶子。",
  photos: [
    {
      src: photo("lakeside-walk.webp"),
      orientation: "landscape",
      alt: "一家三口沿秋日湖边散步",
      caption: "沿着湖走，不赶时间。",
      meta: "十月 · 湖边"
    },
    {
      src: photo("red-kite.webp"),
      orientation: "landscape",
      alt: "孩子在草坡上追着红色风筝奔跑",
      caption: "风把笑声带到了很远的地方。",
      meta: "三月 · 山坡"
    },
    {
      src: photo("autumn-picnic.webp"),
      orientation: "square",
      alt: "秋叶、雨靴和打开的写生本",
      caption: "捡回家的秋天，夹在了画本里。",
      meta: "十月 · 林间"
    }
  ]
};
