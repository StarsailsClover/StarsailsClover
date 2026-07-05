import { Fragment, type ReactNode } from "react";
import SceneBackground from "@/scene/SceneBackground";
import { useGuangzhouWeather } from "@/hooks/useGuangzhouWeather";

export default function PageFrame({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const weather = useGuangzhouWeather();
  return (
    <Fragment>
      <div className="scene-fixed scene-bg">
        <SceneBackground weather={weather} />
      </div>
      <main className="page-frame">
        <div className="page-rail" />
        <header className="page-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </header>
        {children}
      </main>
    </Fragment>
  );
}
