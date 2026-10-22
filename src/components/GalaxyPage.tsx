import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Maximize2, Minimize2, Orbit } from "lucide-react";
import "./GalaxyPage.css";

export default function GalaxyPage() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function updateFullscreen() {
      setIsFullscreen(
        document.fullscreenElement === viewerRef.current,
      );
    }

    document.addEventListener("fullscreenchange", updateFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  async function toggleFullscreen() {
    if (!viewerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      window.open(
        "https://stellarium-web.org/",
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <main className="galaxy-page">
      <header className="galaxy-header">
        <a className="galaxy-brand" href="/" aria-label="Back to club homepage">
          <span className="galaxy-brand-mark">
            <Orbit size={24} />
          </span>
          <span>
            SCIENCE <span className="galaxy-ampersand">&</span> INNOVATION
            <small>CLUB · CAMPUS COMMUNITY</small>
          </span>
        </a>

        <a className="galaxy-back-link" href="/">
          <ArrowLeft size={16} />
          Back to the club
        </a>
      </header>

      <section className="galaxy-intro">
        <div className="galaxy-eyebrow">
          <span className="galaxy-live-dot" />
          SIC / THE COSMOS PROJECT
        </div>

        <h1>
          Look beyond <em>the ordinary.</em>
        </h1>

        <p>
          Explore the night sky, discover celestial objects, and let your
          curiosity travel beyond our planet.
        </p>

        <div className="galaxy-caption">
          AN OPEN INVITATION TO EXPLORE THE UNIVERSE.
        </div>
      </section>

      <section className="galaxy-explorer-section" aria-label="Sky explorer">
        <div className="galaxy-viewer" ref={viewerRef}>
          <div className="galaxy-viewer-toolbar">
            <span>
              <Orbit size={16} />
              STELLARIUM WEB
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullscreen ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>

          <iframe
            className="galaxy-iframe"
            src="https://stellarium-web.org/"
            title="Stellarium Web interactive planetarium"
            allow="fullscreen; geolocation"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="galaxy-explorer-footer">
          <p>
            The sky explorer is provided by Stellarium Web.
            Availability depends on its website and browser policies.
          </p>

          <a
            href="https://stellarium-web.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Stellarium separately <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <footer className="galaxy-footer">
        <a href="/">← Return to Science & Innovation Club</a>
        <span>STAY CURIOUS. KEEP LOOKING UP.</span>
      </footer>
    </main>
  );
}