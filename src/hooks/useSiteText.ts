import { useEffect, useState } from "react";

type HomeSection = { index: string; title: string; text: string };

type SiteText = {
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    weatherPrefix: string;
    sections: HomeSection[];
    porchEyebrow: string;
    porchTitle: string;
    portals: Record<string, string>;
  };
  editor: {
    eyebrow: string;
    title: string;
    saveLocal: string;
    download: string;
    saved: string;
  };
  blog: {
    eyebrow: string;
    title: string;
    xEyebrow: string;
    xTitle: string;
    domesticHint: string;
  };
  github: {
    eyebrow: string;
    title: string;
    modalEyebrow: string;
    modalTitle: string;
    modalHint: string;
    modalConfirm: string;
    modalDecline: string;
    externalUrl: string;
  };
};

const fallbackText: SiteText = {
  home: {
    eyebrow: "StarsailsClover / Waterfall Villa",
    title: "把个人网站，建在瀑布边。",
    lead: "这里不是简历卡片墙，而是一处可滚动进入的数字住所：岩壁、雾、玻璃、暖光与一只保持播放状态的唱片。",
    weatherPrefix: "Guangzhou Atmosphere",
    sections: [
      { index: "01", title: "岩壁", text: "代码、研究与声音被收束在同一处山谷。" },
      { index: "02", title: "瀑布", text: "持续流动的日志、仓库更新与写作草稿。" },
      { index: "03", title: "别墅", text: "冷雾中的现代居所，暖光只为真正的入口亮起。" },
    ],
    porchEyebrow: "Spatial Entrances",
    porchTitle: "抵达门廊，选择下一间房。",
    portals: { blog: "文档长廊", github: "仓库观测台", about: "私人会客室", feed: "水雾广播", music: "音乐水室" },
  },
  editor: {
    eyebrow: "Local First Editor",
    title: "一张贴着水汽的写作台",
    saveLocal: "保存到浏览器本地",
    download: "下载 Markdown 文件",
    saved: "已保存",
  },
  blog: {
    eyebrow: "Blog Archive",
    title: "岩壁上的写作刻痕",
    xEyebrow: "X / x.com/sailshuang_",
    xTitle: "海外访问者可见的水雾短讯",
    domesticHint: "国内访问仅显示站内文章。",
  },
  github: {
    eyebrow: "GitHub Observatory",
    title: "仓库像水线一样记录更新",
    modalEyebrow: "Villa Passage",
    modalTitle: "此室有新室替代，与我共前往？",
    modalHint: "github.sails.n0th1n3ssd0ma1n.top",
    modalConfirm: "与君共往",
    modalDecline: "我甚喜旧",
    externalUrl: "https://github.sails.n0th1n3ssd0ma1n.top",
  },
};

export function useSiteText() {
  const [text, setText] = useState<SiteText>(fallbackText);

  useEffect(() => {
    fetch("/config/text.json")
      .then((response) => response.json())
      .then((data: SiteText) => setText(data))
      .catch(() => setText(fallbackText));
  }, []);

  return text;
}
