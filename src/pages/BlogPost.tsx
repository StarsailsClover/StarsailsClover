import { Link, useParams } from "react-router-dom";
import PageFrame from "@/components/PageFrame";
import MarkdownView from "@/components/MarkdownView";
import { getBlogPost } from "@/lib/blog";
import { useSiteText } from "@/hooks/useSiteText";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);
  const text = useSiteText();

  if (!post) {
    return (
      <PageFrame eyebrow={text.blog.missingEyebrow} title={text.blog.missingTitle}>
        <Link className="text-link" to="/blog">{text.blog.backToBlog}</Link>
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow={`${post.date} / ${post.tags.join(" / ")}`} title={post.title}>
      <MarkdownView source={post.body} />
    </PageFrame>
  );
}
