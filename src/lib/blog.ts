export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  body: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "waterfall-villa-interface",
    title: "把界面做成一处可进入的建筑",
    description: "关于瀑布、岩壁、别墅与个人网站叙事的设计笔记。",
    date: "2026-07-05",
    tags: ["WebGL", "Design", "Architecture"],
    body: `# 把界面做成一处可进入的建筑\n\n首页不是一张名片，而是一条接近某个精神空间的路径。岩壁负责沉默，瀑布负责时间，别墅里的暖光负责人的存在。\n\n## 设计原则\n\n- 用空间关系替代卡片堆叠。\n- 用克制色彩维持真实感。\n- 让音乐播放器成为环境中的一枚仪表。\n\n当访客滚动页面时，相机不是翻页，而是在山谷里缓慢移动。`,
  },
  {
    slug: "local-first-editor",
    title: "本地优先的写作台",
    description: "文档编辑器先保存思考，再考虑同步。",
    date: "2026-06-18",
    tags: ["Markdown", "Editor"],
    body: `# 本地优先的写作台\n\n编辑器应该像随手打开的草稿纸。当前版本把 Markdown 保存在 localStorage 中，避免把未完成的想法过早推向远端。\n\n## 下一步\n\n后续可接入 GitHub Gist 或私有仓库，但 Token 只应存在服务端或本机安全环境。`,
  },
  {
    slug: "music-as-atmosphere",
    title: "音乐不是装饰，是空气密度",
    description: "关于全站浮动音乐播放器与视觉状态的联动。",
    date: "2025-10-05",
    tags: ["Music", "Interaction"],
    body: `# 音乐不是装饰，是空气密度\n\n播放状态会影响界面中微弱的暖光、旋转封面和波形节奏。即使某些历史文件暂时缺失，播放器也应该优雅地跳过失败，而不是打断浏览。`,
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
