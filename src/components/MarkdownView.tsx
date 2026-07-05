import { renderMarkdown } from "@/lib/markdown";

export default function MarkdownView({ source }: { source: string }) {
  return <article className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />;
}
