import { Link, useParams } from "react-router-dom";
import PageFrame from "@/components/PageFrame";
import MarkdownView from "@/components/MarkdownView";
import { getBlogPost } from "@/lib/blog";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <PageFrame eyebrow="Missing" title="这段刻痕暂时不存在">
        <Link className="text-link" to="/blog">返回博客长廊</Link>
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow={`${post.date} / ${post.tags.join(" / ")}`} title={post.title}>
      <MarkdownView source={post.body} />
    </PageFrame>
  );
}
