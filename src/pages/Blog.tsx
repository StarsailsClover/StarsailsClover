import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageFrame from "@/components/PageFrame";
import { blogPosts } from "@/lib/blog";
import { useSiteText } from "@/hooks/useSiteText";

type XItem = { id: string; date: string; text: string; url?: string };

function isLikelyDomestic() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const languages = navigator.languages.join(",").toLowerCase();
  return timezone === "Asia/Shanghai" || languages.includes("zh-cn");
}

export default function Blog() {
  const text = useSiteText();
  const [xItems, setXItems] = useState<XItem[]>([]);
  const domestic = useMemo(() => isLikelyDomestic(), []);

  useEffect(() => {
    if (domestic) return;
    fetch("/data/x-feed.json")
      .then((response) => response.json())
      .then((data) => setXItems(data.items ?? []))
      .catch(() => setXItems([]));
  }, [domestic]);

  return (
    <PageFrame eyebrow={text.blog.eyebrow} title={text.blog.title}>
      <div className="writing-index">
        {blogPosts.map((post) => (
          <Link to={`/blog/${post.slug}`} className="article-line" key={post.slug}>
            <time>{post.date}</time>
            <div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <span>{post.tags.join(" / ")}</span>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
      {!domestic && (
        <section className="x-inline-feed">
          <p className="eyebrow">{text.blog.xEyebrow}</p>
          <h2>{text.blog.xTitle}</h2>
          {xItems.map((item) => (
            <a href={item.url ?? "https://x.com/sailshuang_"} target="_blank" rel="noreferrer" className="article-line x-post-line" key={item.id}>
              <time>{item.date}</time>
              <div><p>{item.text}</p></div>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </section>
      )}
    </PageFrame>
  );
}
