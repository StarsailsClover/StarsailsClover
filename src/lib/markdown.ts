import { marked } from "marked";

marked.use({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(markdown: string) {
  return marked.parse(markdown, { async: false }) as string;
}
