import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import PageFrame from "@/components/PageFrame";
import { useSiteText } from "@/hooks/useSiteText";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
};

export default function GitHub() {
  const text = useSiteText();
  const [showModal, setShowModal] = useState(true);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [status, setStatus] = useState(text.github.statusLoading);

  useEffect(() => {
    if (!showModal) {
      fetch("https://api.github.com/users/StarsailsClover/repos?sort=updated")
        .then((response) => {
          if (!response.ok) throw new Error("GitHub API unavailable");
          return response.json();
        })
        .then((data: Repo[]) => {
          setRepos(data.slice(0, 8));
          setStatus(`${text.github.statusSynced}${new Date().toLocaleString()}`);
        })
        .catch(() => {
          setStatus(text.github.statusOffline);
          setRepos([]);
        });
    }
  }, [showModal, text.github.statusSynced, text.github.statusOffline]);

  if (showModal) {
    const gh = text.github;
    return (
      <div className="portal-modal" role="dialog" aria-modal="true">
        <div className="portal-modal-frame">
          <p className="eyebrow">{gh.modalEyebrow}</p>
          <h2>{gh.modalTitle}</h2>
          <p className="portal-hint">{gh.modalHint}</p>
          <div className="portal-actions">
            <button className="primary" onClick={() => { window.location.href = gh.externalUrl; }}>
              {gh.modalConfirm}
            </button>
            <button onClick={() => setShowModal(false)}>
              {gh.modalDecline}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageFrame eyebrow={text.github.eyebrow} title={text.github.title}>
      <p className="sync-line">{status}</p>
      <div className="repo-river">
        {(repos.length ? repos : [{ id: 0, name: "StarsailsClover", description: text.github.offlineDescription, html_url: "https://github.com/StarsailsClover", language: "Unknown", stargazers_count: 0, updated_at: new Date().toISOString() }]).map((repo) => (
          <a href={repo.html_url} className="repo-line" key={repo.id} target="_blank" rel="noreferrer">
            <span>{repo.language ?? "Text"}</span>
            <strong>{repo.name}</strong>
            <em>{repo.description ?? "No description"}</em>
            <small><Star size={14} /> {repo.stargazers_count} · {new Date(repo.updated_at).toLocaleDateString()}</small>
          </a>
        ))}
      </div>
    </PageFrame>
  );
}
