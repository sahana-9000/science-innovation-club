
import { useEffect, useState } from "react";
import ProximityText from "./components/ProximityText";
import GalaxyPage from "./components/GalaxyPage";
import LabPage from "./components/LabPage";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BrainCircuit,
  Globe2,
  Heart,
  Menu,
  Orbit,
  Radio,
  Sparkles,
  Telescope,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const stories = [
  {
    category: "SPACE",
    time: "5 MIN READ",
    title: "The universe is stranger than we imagined",
    description:
      "From distant galaxies to mysterious cosmic signals, every discovery opens a new question.",
    tag: "ASTRONOMY",
    symbol: "✳",
    color: "lavender",
  },
  {
    category: "INNOVATION",
    time: "4 MIN READ",
    title: "Small ideas can build a different future",
    description:
      "Meet the experimental technologies helping students turn curiosity into working prototypes.",
    tag: "ENGINEERING",
    symbol: "⌘",
    color: "mint",
  },
  {
    category: "ARTIFICIAL INTELLIGENCE",
    time: "6 MIN READ",
    title: "Can machines learn to think more efficiently?",
    description:
      "Researchers are exploring compact AI models that can work directly on everyday devices.",
    tag: "COMPUTING",
    symbol: "◈",
    color: "peach",
  },
];

const projects = [
  {
    number: "01",
    title: "Ideas into inventions",
    type: "STUDENT PROJECTS",
    description:
      "Explore the prototypes, experiments and ambitious ideas being built by our community.",
    icon: BrainCircuit,
  },
  {
    number: "02",
    title: "Conversations that spark",
    type: "PODCASTS & INTERVIEWS",
    description:
      "Hear from student innovators, competition finalists and people shaping science.",
    icon: Radio,
  },
  {
    number: "03",
    title: "Beyond the classroom",
    type: "EVENTS & CHALLENGES",
    description:
      "Find opportunities to collaborate, experiment, compete and learn something new.",
    icon: Globe2,
  },
];

const topics = [
  { name: "Space", icon: "✳", detail: "Explore the universe" },
  { name: "AI & Robotics", icon: "⌘", detail: "Build what comes next" },
  { name: "Life Sciences", icon: "❋", detail: "Understand living systems" },
  { name: "Future Tech", icon: "↗", detail: "Question what's possible" },
];

function HomePage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const categories = ["ALL", "SPACE", "INNOVATION", "ARTIFICIAL INTELLIGENCE"];

  const filteredStories =
    activeCategory === "ALL"
      ? stories
      : stories.filter((story) => story.category === activeCategory);

  function toggleNumber(
    number: number,
    current: number[],
    update: (value: number[]) => void,
  ) {
    update(
      current.includes(number)
        ? current.filter((item) => item !== number)
        : [...current, number],
    );
  }

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      email.trim()
        ? "Thanks for your curiosity! Newsletter delivery will be connected when we set up the backend."
        : "Please enter a valid email address.",
    );
  }

  return (
    <main>
      <div className="announcement">
        <span className="announcement-dot" />
        A COMMUNITY FOR THE CURIOUS
        <span className="announcement-divider">/</span>
        THINK. EXPLORE. CREATE.
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="Science and Innovation Club home">
          <span className="brand-mark"><Orbit size={25} strokeWidth={1.7} /></span>
          <span className="brand-name">
            SCIENCE <span>&</span> INNOVATION
            <small>CLUB · CAMPUS COMMUNITY</small>
          </span>
        </a>

        <nav className={mobileMenu ? "main-nav nav-open" : "main-nav"}>
          <a href="#discover" onClick={() => setMobileMenu(false)}>Discover</a>
          <a href="#stories" onClick={() => setMobileMenu(false)}>The feed</a>
          <a href="#projects" onClick={() => setMobileMenu(false)}>Our world</a>
          <a href="#topics" onClick={() => setMobileMenu(false)}>Explore</a>
          <a href={`${import.meta.env.BASE_URL}#/galaxy`} onClick={() => setMobileMenu(false)}>Galaxy</a>
          <a href={`${import.meta.env.BASE_URL}#/lab`} onClick={() => setMobileMenu(false)}>Virtual Lab</a>
          <a className="nav-join" href="#join" onClick={() => setMobileMenu(false)}>
            Join the curious <ArrowUpRight size={16} />
          </a>
        </nav>

        <button
          className="mobile-menu-button"
          aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            YOUR CURIOSITY BELONGS HERE
          </div>
          
          <h1>
              <ProximityText text="Stay curious." />
              <br />
              <ProximityText text="Think" />{" "}
              <span className="hero-italic">
                <ProximityText text="bigger." />
              </span>
          </h1>

          <p className="hero-description">
            A meeting place for curious minds, unexpected ideas and the people
            who want to understand how the world works — and how to make it
            better.
          </p>
          <div className="hero-actions">
            <a href="#stories" className="button-primary">
              Enter our world <ArrowUpRight size={17} />
            </a>
            <a href="#discover" className="button-text">
              Get to know us <ArrowDownRight size={17} />
            </a>
          </div>
          
        </div>

        <div className="hero-art" aria-label="Abstract illustration of an orbiting planet">
          <div className="art-label art-label-top">FIG. 001 — CURIOSITY</div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="planet">
            <div className="planet-highlight" />
            <div className="planet-ring" />
          </div>
          <div className="satellite satellite-one" />
          <div className="satellite satellite-two" />
          <div className="art-cross cross-one">+</div>
          <div className="art-cross cross-two">+</div>
          <div className="art-caption">
            <span>THE UNKNOWN</span>
            <span>IS AN INVITATION.</span>
          </div>
          <div className="art-coordinate">11° 01' N / 76° 57' E</div>
        </div>

        <a className="hero-scroll" href="#discover">
          <span>SCROLL TO EXPLORE</span><ArrowDownRight size={15} />
        </a>
        <div className="hero-index">SIC / 2026</div>
      </section>

      <section className="intro-section section-pad" id="discover">
        <div className="section-kicker"><span>01</span> WHY WE EXIST</div>
        <div className="intro-content">
          <h2>
            Science isn't just
            <br />
            something you <span>study.</span>
            <br />
            It's something you <em>feel.</em>
          </h2>
          <div className="intro-side">
            <p>
              The best questions rarely stay inside a textbook. They lead to
              late-night experiments, conversations that change your mind and
              ideas that become something real.
            </p>
            <p>
              We're building a campus community where curiosity has room to
              grow — together.
            </p>
            <a href="#projects" className="inline-link">
              A little more about us <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="intro-bottom">
          <span>QUESTION EVERYTHING.</span>
          <span>STAY OPEN TO POSSIBILITY. <Sparkles size={15} /></span>
        </div>
      </section>

      <section className="feed-section section-pad" id="stories">
        <div className="section-heading">
          <div>
            <div className="section-kicker"><span>02</span> THE CURIOSITY FEED</div>
            
            <h2>
              <ProximityText text="Something to" />{" "}
              <em>
                <ProximityText text="wonder about." />
              </em>
            </h2>

          </div>
          <a href="#topics" className="inline-link desktop-link">
            Follow a question <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="feed-toolbar">
          <span className="feed-label"><span className="live-dot" /> A FEED FOR CURIOUS MINDS</span>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "filter active" : "filter"}
                onClick={() => setActiveCategory(category)}
              >
                {category === "ARTIFICIAL INTELLIGENCE" ? "AI" : category}
              </button>
            ))}
          </div>
        </div>

        <div className="story-grid">
          {filteredStories.map((story) => {
            const originalIndex = stories.indexOf(story);
            const isLiked = liked.includes(originalIndex);
            const isSaved = saved.includes(originalIndex);

            return (
              <article className="story-card" key={story.title}>
                <div className={`story-art ${story.color}`}>
                  <span className="story-art-index">SIC / 0{originalIndex + 1}</span>
                  <span className="story-symbol">{story.symbol}</span>
                  <span className="story-art-tag">{story.tag}</span>
                  <span className="story-orbit story-orbit-a" />
                  <span className="story-orbit story-orbit-b" />
                </div>
                <div className="story-meta">
                  <span>{story.category}</span>
                  <span>{story.time}</span>
                </div>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <div className="story-footer">
                  <button
                    className={isLiked ? "story-action action-on" : "story-action"}
                    aria-label={isLiked ? "Unlike story" : "Like story"}
                    onClick={() => toggleNumber(originalIndex, liked, setLiked)}
                  >
                    <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </button>
                  <button
                    className={isSaved ? "story-action action-on" : "story-action"}
                    aria-label={isSaved ? "Remove bookmark" : "Bookmark story"}
                    onClick={() => toggleNumber(originalIndex, saved, setSaved)}
                  >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    className="story-open"
                    aria-label={`Explore ${story.title}`}
                    onClick={() => setMessage("Story detail pages will be added in the next stage.")}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="sample-note">
          Preview stories are illustrative examples, not verified news articles.
          Real sourced news and comments will be added in a later stage.
        </p>
      </section>

      <section className="manifesto">
        <div className="manifesto-orbit manifesto-orbit-a" />
        <div className="manifesto-orbit manifesto-orbit-b" />
        <div className="manifesto-content">
          <div className="section-kicker light-kicker"><span>03</span> CURIOSITY, IN ACTION</div>
          <h2>
            Don't just read
            <br />
            about the future.
            <br />
            <em>Make something.</em>
          </h2>
          <p>
            Your next big idea might start with a tiny experiment, a team of
            friends or a question nobody has answered yet.
          </p>
          <a href="#projects" className="button-light">
            See what we're building <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="manifesto-side-note">THINK / TEST / LEARN / REPEAT</div>
        <div className="manifesto-bottom">POSSIBILITY IS A PRACTICE.</div>
      </section>

      <section className="projects-section section-pad" id="projects">
        <div className="section-heading">
          <div>
            <div className="section-kicker"><span>04</span> INSIDE OUR COMMUNITY</div>
            <h2>Many ways to <em>get involved.</em></h2>
          </div>
          <span className="section-aside">ONE COMMUNITY. INFINITE QUESTIONS.</span>
        </div>

        <div className="project-list">
          {projects.map((project) => {
            const ProjectIcon = project.icon;
            return (
              <a href="#join" className="project-row" key={project.number}>
                <span className="project-number">{project.number}</span>
                <span className="project-icon"><ProjectIcon size={25} strokeWidth={1.5} /></span>
                <span className="project-copy">
                  <span className="project-type">{project.type}</span>
                  <span className="project-title">{project.title}</span>
                  <span className="project-description">{project.description}</span>
                </span>
                <span className="project-arrow"><ArrowUpRight size={22} /></span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="topics-section section-pad" id="topics">
        <div className="section-heading">
          <div>
            <div className="section-kicker"><span>05</span> PICK YOUR RABBIT HOLE</div>
            <h2>Where will curiosity <em>take you?</em></h2>
          </div>
          <Telescope className="topics-heading-icon" size={32} strokeWidth={1.3} />
        </div>
        <div className="topic-grid">
          {topics.map((topic, index) => (
            <a
              href="#stories"
              className={`topic-card topic-${index + 1}`}
              key={topic.name}
              onClick={() => setActiveCategory(index === 0 ? "SPACE" : "ALL")}
            >
              <span className="topic-icon">{topic.icon}</span>
              <span className="topic-name">{topic.name}</span>
              <span className="topic-detail">{topic.detail}</span>
              <ArrowUpRight className="topic-arrow" size={18} />
            </a>
          ))}
        </div>
      </section>

      <section className="join-section section-pad" id="join">
        <div className="join-decoration"><Zap size={25} strokeWidth={1.4} /></div>
        <div className="join-copy">
          <div className="section-kicker"><span>06</span> YOUR NEXT CHAPTER</div>
          <h2>Stay curious.<br /><em>Stay connected.</em></h2>
          <p>
            Get a little science, a little inspiration and a reason to ask
            another question.
          </p>
        </div>
        <form className="join-form" onSubmit={handleSubscribe}>
          <label htmlFor="join-email">YOUR EMAIL ADDRESS</label>
          <div className="email-field">
            <input
              id="join-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" aria-label="Submit email">
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="form-small">No spam. Just things worth thinking about.</p>
          {message && <p className="form-message" role="status">{message}</p>}
        </form>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark"><Orbit size={23} strokeWidth={1.7} /></span>
          <span className="brand-name">
            SCIENCE <span>&</span> INNOVATION
            <small>CLUB · CAMPUS COMMUNITY</small>
          </span>
        </a>
        <p>Curiosity connects us. Discovery moves us.</p>
        <div className="footer-right">
          <span>BUILT FOR THE CURIOUS</span>
          <a href="#home">BACK TO TOP ↑</a>
        </div>
      </footer>

      {message && (
        <div className="status-toast" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message"><X size={16} /></button>
        </div>
      )}
    </main>
  );
}

function App() {
  const [path, setPath] = useState(() =>
    window.location.hash.replace(/^#\/?/, "").replace(/\/+$/, ""),
  );

  useEffect(() => {
    const syncPath = () => {
      setPath(window.location.hash.replace(/^#\/?/, "").replace(/\/+$/, ""));
    };

    window.addEventListener("hashchange", syncPath);
    return () => window.removeEventListener("hashchange", syncPath);
  }, []);

  if (path === "galaxy") {
    return <GalaxyPage />;
  }

  if (path === "lab") {
    return <LabPage />;
  }

  return <HomePage />;
}

export default App;
