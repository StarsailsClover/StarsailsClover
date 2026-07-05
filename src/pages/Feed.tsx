import { useEffect, useState } from "react";
import PageFrame from "@/components/PageFrame";

type FeedItem = { id: string; date: string; text: string; url?: string };

export default function Feed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch("/data/x-feed.json")
      .then((response) => response.json())
      .then((data) => setFeed(data.items ?? []))
      .catch(() => setFeed([
        { id: "fallback", date: "2026-07-05", text: "当前为静态镜像模式；未来可由服务端或构建脚本同步 X 数据。" },
      ]));
  }, []);

  return (
    <PageFrame eyebrow="X Mirror" title="没有令牌暴露的动态水雾">
      <p className="sync-line">读取 /data/x-feed.json；后续可由服务端同步 x.com/sailshuang_。</p>
      <div className="feed-stream">
        {feed.map((item) => (
          <article key={item.id}>
            <time>{item.date}</time>
            <p>{item.text}</p>
            {item.url && <a className="text-link" href={item.url} target="_blank" rel="noreferrer">Open X</a>}
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
