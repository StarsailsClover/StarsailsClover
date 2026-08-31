import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Aperture, Github, Home as HomeIcon, Music2, PenLine, Rss, UserRound } from "lucide-react";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Editor from "@/pages/Editor";
import GitHub from "@/pages/GitHub";
import About from "@/pages/About";
import Feed from "@/pages/Feed";
import Music from "@/pages/Music";
import FloatingMusicPlayer from "@/components/music/FloatingMusicPlayer";
import { MusicProvider } from "@/components/music/MusicProvider";
import { useSiteText } from "@/hooks/useSiteText";

const navItems = [
  { to: "/", key: "villa", icon: HomeIcon },
  { to: "/blog", key: "blog", icon: PenLine },
  { to: "/github", key: "github", icon: Github },
  { to: "/about", key: "about", icon: UserRound },
  { to: "/feed", key: "feed", icon: Rss },
  { to: "/music", key: "music", icon: Music2 },
  { to: "/editor", key: "editor", icon: Aperture },
];

function SiteShell() {
  const text = useSiteText();
  return (
    <>
      <nav className="site-nav" aria-label="主导航">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-mark">
              <Icon size={15} />
              <span>{text.nav[item.key] ?? item.key}</span>
            </NavLink>
          );
        })}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/github" element={<GitHub />} />
        <Route path="/about" element={<About />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/music" element={<Music />} />
      </Routes>
      <FloatingMusicPlayer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MusicProvider>
        <SiteShell />
      </MusicProvider>
    </BrowserRouter>
  );
}
