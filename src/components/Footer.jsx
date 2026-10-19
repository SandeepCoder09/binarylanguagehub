import { Terminal, Instagram, ExternalLink, ArrowLeftRight, BookOpen, RefreshCw } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  function triggerBoot() {
    try {
      sessionStorage.removeItem('blh_booted');
      window.location.reload();
    } catch (_) {}
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <Terminal size={18} />
          </span>
          <span>
            <strong>BINARY LANGUAGE</strong>
            <small>CODE THE FUTURE_</small>
          </span>
        </div>

        <p className="footer-tagline">Built for curious minds. Keep learning, keep building.</p>

        {/* Status indicator — decorative only */}
        <div className="footer-status" aria-label="Platform status indicator">
          <span className="status-dot" aria-hidden="true" />
          <span>Platform online</span>
          <span className="status-note">(local client only — no external telemetry)</span>
        </div>

        {/* Nav links */}
        <nav className="footer-nav" aria-label="Footer navigation">
          <button className="btn-click-fx" onClick={() => onNavigate('home')}>Home</button>
          <button className="btn-click-fx" onClick={() => onNavigate('translator')}>
            <ArrowLeftRight size={12} aria-hidden="true" /> Translator
          </button>
          <button className="btn-click-fx" onClick={() => onNavigate('quiz')}>Quiz</button>
          <button className="btn-click-fx" onClick={() => onNavigate('learn')}>
            <BookOpen size={12} aria-hidden="true" /> Lessons
          </button>
          <a
            className="btn-click-fx"
            href="https://www.instagram.com/sandycoder09/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="@sandycoder09 on Instagram (opens in a new tab)"
          >
            <Instagram size={13} aria-hidden="true" />
            @sandycoder09
            <ExternalLink size={11} aria-hidden="true" />
          </a>
          <button
            className="btn-click-fx"
            onClick={triggerBoot}
            title="Re-run terminal boot animation"
            style={{ opacity: 0.65 }}
          >
            <RefreshCw size={11} aria-hidden="true" /> Boot Sequence
          </button>
        </nav>

        {/* Disclaimer */}
        <p className="footer-disclaimer">
          <strong>Educational note:</strong> All learning content on this site is for educational purposes only.
          Quiz scores and lesson progress are stored locally in your browser and do not sync across devices.
          Practice cybersecurity concepts only on systems you own or have explicit permission to test.
        </p>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© {year} BINARY LANGUAGE</span>
          <span>DESIGNED IN GREEN / BUILT WITH CURIOSITY</span>
        </div>
      </div>
    </footer>
  );
}
