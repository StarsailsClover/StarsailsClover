import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Music2, PenLine, Rss, UserRound } from "lucide-react";
import WaterfallVillaScene from "@/scene/WaterfallVillaScene";
import { useMusic } from "@/components/music/MusicProvider";
import { useGuangzhouWeather } from "@/hooks/useGuangzhouWeather";
import { useSiteText } from "@/hooks/useSiteText";

const portals = [
  { key: "blog", to: "/blog", icon: PenLine },
  { key: "github", to: "/github", icon: Github },
  { key: "about", to: "/about", icon: UserRound },
  { key: "feed", to: "/feed", icon: Rss },
  { key: "music", to: "/music", icon: Music2 },
];

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);
  const { isPlaying } = useMusic();
  const text = useSiteText();
  const weather = useGuangzhouWeather();

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Fragment>
      <div className="scene-fixed">
        <WaterfallVillaScene scrollProgress={scrollProgress} musicActive={isPlaying} weather={weather} />
      </div>
      <main className="home-page">
        <section className="hero-section">
          <div className="weather-chip">
            <span>{text.home.weatherPrefix}</span>
            <strong>{weather.label}{weather.timeString ? ` · ${weather.timeString}` : ""}</strong>
            {weather.temperature !== null && (
              <small>{weather.temperature}°C{weather.humidity !== null ? ` · 湿度 ${weather.humidity}%` : ""}</small>
            )}
          </div>
          <div className="hero-copy reveal-block">
            <p className="eyebrow">{text.home.eyebrow}</p>
            <h1>{text.home.title}</h1>
            <p>{text.home.lead}</p>
          </div>
        </section>
        {text.home.sections.map((section) => (
          <section className="narrative-section" key={section.index}>
            <div className="section-marker">{section.index}</div>
            <div className="reveal-block">
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>
          </section>
        ))}
        <section className="porch-section">
          <div className="porch-copy reveal-block">
            <p className="eyebrow">{text.home.porchEyebrow}</p>
            <h2>{text.home.porchTitle}</h2>
          </div>
          <div className="portal-row">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <Link className="portal-door" to={portal.to} key={portal.to}>
                  <Icon size={17} />
                  <span>{text.home.portals[portal.key] ?? portal.key}</span>
                  <ArrowUpRight size={15} />
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </Fragment>
  );
}
