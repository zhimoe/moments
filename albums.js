/*
 * 相册数据都在这里。新增相册时复制一个对象，再替换标题、封面和照片即可。
 * orientation 可选：landscape / portrait / square。照片始终使用原始比例展示。
 */
window.FAMILY_ALBUMS = [
  {
    id: "autumn-notes",
    number: "01",
    title: "秋日小记",
    subtitle: "风经过湖面，也经过我们的周末",
    date: "2026 · AUTUMN",
    tone: "moss",
    cover: "assets/photos/lakeside-walk.webp",
    intro: "天气开始变凉以后，我们把一些慢下来的时刻留了下来。散步、风筝，还有落在毯子上的叶子。",
    photos: [
      {
        src: "assets/photos/lakeside-walk.webp",
        orientation: "landscape",
        alt: "一家三口沿秋日湖边散步",
        caption: "沿着湖走，不赶时间。",
        meta: "十月 · 湖边"
      },
      {
        src: "assets/photos/red-kite.webp",
        orientation: "landscape",
        alt: "孩子在草坡上追着红色风筝奔跑",
        caption: "风把笑声带到了很远的地方。",
        meta: "三月 · 山坡"
      },
      {
        src: "assets/photos/autumn-picnic.webp",
        orientation: "square",
        alt: "秋叶、雨靴和打开的写生本",
        caption: "捡回家的秋天，夹在了画本里。",
        meta: "十月 · 林间"
      }
    ]
  },
  {
    id: "sea-breeze",
    number: "02",
    title: "海风与我们",
    subtitle: "太阳落下去以前，再沿着海岸走一段",
    date: "2026 · SUMMER",
    tone: "ocean",
    cover: "assets/photos/dusk-walk.webp",
    intro: "我们没有带回多少纪念品，只带回鞋里的细沙、晒暖的毛巾，以及许多关于蓝色的记忆。",
    photos: [
      {
        src: "assets/photos/dusk-walk.webp",
        orientation: "portrait",
        alt: "一家三口在傍晚的海边牵手散步",
        caption: "潮水退去，影子被晚霞拉得很长。",
        meta: "七月 · 南岸"
      },
      {
        src: "assets/photos/shells.webp",
        orientation: "landscape",
        alt: "孩子在海边捡拾贝壳",
        caption: "每一枚贝壳，都有被认真挑选的理由。",
        meta: "七月 · 清晨"
      },
      {
        src: "assets/photos/shoes-by-sea.webp",
        orientation: "square",
        alt: "一家三口留在海浪边的鞋子",
        caption: "鞋留在岸上，我们一起去追浪。",
        meta: "七月 · 日落前"
      },
      {
        src: "assets/photos/after-swim.webp",
        orientation: "portrait",
        alt: "孩子披着毛巾望向落日下的海面",
        caption: "海风吹干头发，也吹走了最后一点暑气。",
        meta: "七月 · 傍晚"
      }
    ]
  },
  {
    id: "rainy-morning",
    number: "03",
    title: "雨天早餐",
    subtitle: "窗外下着雨，桌边是慢慢醒来的早晨",
    date: "2026 · SPRING",
    tone: "clay",
    cover: "assets/photos/rainy-breakfast.webp",
    intro: "有时值得留下来的，并不是远方，而是一顿不用赶时间的早餐。窗上的雨、剥开的橘子，还有坐在一起的片刻。",
    photos: [
      {
        src: "assets/photos/rainy-breakfast.webp",
        orientation: "landscape",
        alt: "雨天窗边的家庭早餐桌",
        caption: "雨没有停，早餐就吃得慢一些。",
        meta: "四月 · 家中"
      }
    ]
  }
];
