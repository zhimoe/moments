const photo = (name) => new URL(name, import.meta.url).href;

export default {
  id: "sea-breeze",
  number: "02",
  title: "海风与我们",
  subtitle: "太阳落下去以前，再沿着海岸走一段",
  date: "2026 · SUMMER",
  tone: "ocean",
  cover: photo("dusk-walk.webp"),
  intro: "我们没有带回多少纪念品，只带回鞋里的细沙、晒暖的毛巾，以及许多关于蓝色的记忆。",
  photos: [
    {
      src: photo("dusk-walk.webp"),
      orientation: "portrait",
      alt: "一家三口在傍晚的海边牵手散步",
      caption: "潮水退去，影子被晚霞拉得很长。",
      meta: "七月 · 南岸"
    },
    {
      src: photo("shells.webp"),
      orientation: "landscape",
      alt: "孩子在海边捡拾贝壳",
      caption: "每一枚贝壳，都有被认真挑选的理由。",
      meta: "七月 · 清晨"
    },
    {
      src: photo("shoes-by-sea.webp"),
      orientation: "square",
      alt: "一家三口留在海浪边的鞋子",
      caption: "鞋留在岸上，我们一起去追浪。",
      meta: "七月 · 日落前"
    },
    {
      src: photo("after-swim.webp"),
      orientation: "portrait",
      alt: "孩子披着毛巾望向落日下的海面",
      caption: "海风吹干头发，也吹走了最后一点暑气。",
      meta: "七月 · 傍晚"
    }
  ]
};
