import { useEffect, useState } from "react";

export type SiteText = {
  nav: Record<string, string>;
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    weatherPrefix: string;
    humidityLabel: string;
    windLabel: string;
    scrollHint: string;
    sections: { index: string; title: string; text: string }[];
    porchEyebrow: string;
    porchTitle: string;
    portals: Record<string, string>;
  };
  about: {
    eyebrow: string;
    title: string;
    lead: string;
    timeline: { label: string; text: string }[];
  };
  music: {
    eyebrow: string;
    title: string;
    nowPlaying: string;
    silentTitle: string;
    waitingArtist: string;
  };
  editor: {
    eyebrow: string;
    title: string;
    autosavePrefix: string;
    saveLocal: string;
    download: string;
  };
  blog: {
    eyebrow: string;
    title: string;
    xEyebrow: string;
    xTitle: string;
    missingEyebrow: string;
    missingTitle: string;
    backToBlog: string;
  };
  github: {
    eyebrow: string;
    title: string;
    statusLoading: string;
    statusSynced: string;
    statusOffline: string;
    offlineDescription: string;
    modalEyebrow: string;
    modalTitle: string;
    modalHint: string;
    modalConfirm: string;
    modalDecline: string;
    externalUrl: string;
  };
};

const defaults: SiteText = {
  nav: { villa: "Villa", blog: "Blog", github: "GitHub", about: "About", feed: "Feed", music: "Music", editor: "Editor" },
  home: {
    eyebrow: "StarsailsClover / Waterfall Villa",
    title: "把个人网站，建在瀑布边。",
    lead: "这里不是简历卡片墙，而是一处可滚动进入的数字住所：岩壁、雾、玻璃、暖光与一只保持播放状态的唱片。",
    weatherPrefix: "Guangzhou Atmosphere",
    humidityLabel: "湿度",
    windLabel: "风",
    scrollHint: "Scroll",
    sections: [
      { index: "01", title: "岩壁", text: "代码、研究与声音被收束在同一处山谷。" },
      { index: "02", title: "瀑布", text: "持续流动的日志、仓库更新与写作草稿。" },
      { index: "03", title: "别墅", text: "冷雾中的现代居所，暖光只为真正的入口亮起。" },
    ],
    porchEyebrow: "Spatial Entrances",
    porchTitle: "抵达门廊，选择下一间房。",
    portals: { blog: "文档长廊", github: "仓库观测台", about: "私人会客室", feed: "水雾广播", music: "音乐水室" },
  },
  about: {
    eyebrow: "About",
    title: "一个在冷雾中点亮暖光的人",
    lead: "StarsailsClover 的个人空间以代码为骨架，以音乐和写作为水汽。这里展示的不是传统履历表，而是长期创作留下的路径。",
    timeline: [
      { label: "Code", text: "用工程方法整理想法，让小工具逐步成为稳定作品。" },
      { label: "Research", text: "关注 AI、交互、知识系统与可持续维护的个人基础设施。" },
      { label: "Music", text: "把情绪说唱、采样和夜间写作放进同一条时间线。" },
    ],
  },
  music: {
    eyebrow: "Music Room",
    title: "水室里的播放队列",
    nowPlaying: "Now Playing",
    silentTitle: "静默",
    waitingArtist: "等待播放列表",
  },
  editor: {
    eyebrow: "Local First Editor",
    title: "一张贴着水汽的写作台",
    autosavePrefix: "自动保存于",
    saveLocal: "保存到浏览器本地",
    download: "下载 Markdown 文件",
  },
  blog: {
    eyebrow: "Blog Archive",
    title: "岩壁上的写作刻痕",
    xEyebrow: "X / x.com/sailshuang_",
    xTitle: "海外访问者可见的水雾短讯",
    missingEyebrow: "Missing",
    missingTitle: "这段刻痕暂时不存在",
    backToBlog: "返回博客长廊",
  },
  github: {
    eyebrow: "GitHub Observatory",
    title: "仓库像水线一样记录更新",
    statusLoading: "正在读取公开仓库轨迹…",
    statusSynced: "同步完成：",
    statusOffline: "GitHub 公开接口暂时不可达，显示离线观测模式。",
    offlineDescription: "离线模式：公开仓库将在网络恢复后出现。",
    modalEyebrow: "Villa Passage",
    modalTitle: "此室有新室替代，与我共前往？",
    modalHint: "starsails.n0th1n3ssd0ma1n.top",
    modalConfirm: "与君共往",
    modalDecline: "我甚喜旧",
    externalUrl: "http://starsails.n0th1n3ssd0ma1n.top",
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 局部覆盖合并：JSON 里写了什么就替换什么，其余沿用默认值；数组整体替换
function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch) || !isPlainObject(base)) {
    return (patch === undefined ? base : (patch as T));
  }
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = key in base ? deepMerge((base as Record<string, unknown>)[key], value) : value;
  }
  return merged as T;
}

let remoteText: Promise<unknown> | null = null;

function loadRemoteText() {
  if (!remoteText) {
    remoteText = fetch("/config/text.json").then(async (response) => {
      if (!response.ok) throw new Error(`text.json ${response.status}`);
      // 手工编辑保存的文件可能带 UTF-8 BOM，json() 之前先剥掉
      const raw = await response.text();
      return JSON.parse(raw.replace(/^\uFEFF/, ""));
    });
  }
  return remoteText;
}

export function useSiteText(): SiteText {
  const [text, setText] = useState<SiteText>(defaults);

  useEffect(() => {
    let cancelled = false;
    loadRemoteText()
      .then((data) => {
        if (!cancelled) setText(deepMerge(defaults, data));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return text;
}
