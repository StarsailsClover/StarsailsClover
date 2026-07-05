import { useEffect, useState } from "react";
import { Download, Save } from "lucide-react";
import MarkdownView from "@/components/MarkdownView";
import PageFrame from "@/components/PageFrame";
import { useSiteText } from "@/hooks/useSiteText";

const initialDraft = "# 新文档\n\n在瀑布声旁写下新的段落。\n\n- 支持 Markdown\n- 实时预览\n- localStorage 自动保存";
const storageKey = "starsailsclover-editor-draft";

export default function Editor() {
  const text = useSiteText();
  const [draft, setDraft] = useState(() => localStorage.getItem(storageKey) ?? initialDraft);
  const [savedAt, setSavedAt] = useState<string>("刚刚");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(storageKey, draft);
      setSavedAt(new Date().toLocaleTimeString());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const saveLocal = () => {
    localStorage.setItem(storageKey, draft);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const downloadMarkdown = () => {
    const blob = new Blob([draft], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `starsails-note-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageFrame eyebrow={text.editor.eyebrow} title={text.editor.title}>
      <div className="editor-toolbar">
        <span><Save size={16} /> 自动保存于 {savedAt}</span>
        <button type="button" onClick={saveLocal}><Save size={15} /> {text.editor.saveLocal}</button>
        <button type="button" onClick={downloadMarkdown}><Download size={15} /> {text.editor.download}</button>
      </div>
      <section className="editor-grid">
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Markdown 编辑器" />
        <MarkdownView source={draft} />
      </section>
    </PageFrame>
  );
}
