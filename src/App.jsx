import { useState, useCallback, useEffect, Component } from 'react';
import {
  Terminal, ArrowLeftRight, BrainCircuit, BookOpen,
  Menu, X, ChevronRight, Zap,
  Binary, Code2, ShieldCheck, Cpu,
} from 'lucide-react';

import BinaryRain from './components/BinaryRain.jsx';
import HeroSection from './components/HeroSection.jsx';
import BinaryTranslator from './components/BinaryTranslator.jsx';
import QuizSection from './components/QuizSection.jsx';
import LessonsSection from './components/LessonsSection.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import ScrollReveal from './components/ScrollReveal.jsx';
import TerminalBoot from './components/TerminalBoot.jsx';
import { questions } from './data/questions.js';
import { lessons } from './data/lessons.js';

// ── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('System Exception intercepted by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ maxWidth: '520px', border: '1.5px solid rgba(255, 77, 77, 0.6)', borderRadius: '10px', padding: '36px 28px', background: 'rgba(20, 4, 4, 0.95)', boxShadow: '0 0 35px rgba(255, 77, 77, 0.3)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '14px', color: '#ff4d4d', letterSpacing: '.04em' }}>[SYSTEM_EXCEPTION]</div>
            <p style={{ color: '#f4fff6', marginBottom: '8px', fontSize: '0.95rem' }}>An execution fault occurred in this module.</p>
            <p style={{ color: '#ff8080', marginBottom: '24px', fontSize: '0.8rem', fontStyle: 'italic', wordBreak: 'break-all' }}>{this.state.error?.message || 'Unknown fault'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{ background: '#00ff41', color: '#000000', fontWeight: '800', padding: '12px 26px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em', boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)' }}
            >
              RESTART MODULE
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── localStorage helpers ────────────────────────────────────────────────────
function loadScore() {
  const n = Number(localStorage.getItem('blh-score'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function loadCompleted() {
  try {
    const parsed = JSON.parse(localStorage.getItem('blh-completed-lessons') || '[]');
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// ── Navigation config ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'translator', label: 'Translator', icon: ArrowLeftRight },
  { id: 'quiz',       label: 'Quiz',       icon: BrainCircuit   },
  { id: 'learn',      label: 'Learn',      icon: BookOpen        },
];

// ── Feature card for home page ──────────────────────────────────────────────
function FeatureCard({ icon: Icon, number, title, description, action, onClick }) {
  return (
    <article className="feature-card cyber-card card-hover-lift">
      <div className="feature-card-top">
        <span className="feature-icon"><Icon size={22} aria-hidden="true" /></span>
        <span className="feature-number">{number} / MODULE</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={onClick} className="feature-link btn-click-fx">
        <span>{action}</span>
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </article>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [score, setScore] = useState(loadScore);
  const [completedLessons, setCompletedLessons] = useState(loadCompleted);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [scorePulsing, setScorePulsing] = useState(false);
  const [booting, setBooting] = useState(() => {
    // Only boot if not yet booted this session and user didn't request reduced motion
    try {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
      return !sessionStorage.getItem('blh_booted');
    } catch {
      return false;
    }
  });

  // ── Navigation ────────────────────────────────────────────────────────
  const goTo = useCallback((id) => {
    setActive(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Score update (from Quiz) ──────────────────────────────────────────
  const handleScoreUpdate = useCallback((earned) => {
    setScore(prev => {
      const next = prev + earned;
      localStorage.setItem('blh-score', String(next));
      return next;
    });
    setScorePulsing(true);
    setTimeout(() => setScorePulsing(false), 900);
  }, []);

  // ── Lesson complete ───────────────────────────────────────────────────
  const handleLessonComplete = useCallback((id) => {
    setCompletedLessons(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('blh-completed-lessons', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ msg: '', type: 'success' });
  }, []);

  // ── Home page ─────────────────────────────────────────────────────────
  const HomePage = (
    <>
      <HeroSection
        score={score}
        totalLessons={lessons.length}
        totalQuestions={questions.length}
        onNavigate={goTo}
      />

      {/* Feature grid section with ScrollReveal */}
      <section className="feature-section section-wrap">
        <ScrollReveal variant="fade-up">
          <div className="section-heading">
            <div>
              <div className="eyebrow-text">MODULAR ARCHITECTURE</div>
              <h2>Explore the <span className="accent-text">matrix.</span></h2>
            </div>
            <p>Master computing primitives from bare silicon to abstract logic.</p>
          </div>
        </ScrollReveal>

        <div className="feature-grid">
          <ScrollReveal variant="fade-up" delay={50}>
            <FeatureCard
              icon={ArrowLeftRight}
              number="01"
              title="Binary Transcoder"
              description="Convert text into 0s and 1s or decode raw bitstreams back into characters in real time with client-side sandbox safety."
              action="Launch Lab"
              onClick={() => goTo('translator')}
            />
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={150}>
            <FeatureCard
              icon={BrainCircuit}
              number="02"
              title="Verification Drills"
              description={`${questions.length} high-yield questions across 10 categories. Practice untimed or beat the clock in Timed Rush mode.`}
              action="Test Knowledge"
              onClick={() => goTo('quiz')}
            />
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={250}>
            <FeatureCard
              icon={BookOpen}
              number="03"
              title="Knowledge Curriculum"
              description={`${lessons.length} structured modules covering base-2 math, ASCII matrices, logic gates, and memory registers.`}
              action="Browse Syllabus"
              onClick={() => goTo('learn')}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Callout CTA with ScrollReveal */}
      <section className="callout-section-wrap section-wrap">
        <ScrollReveal variant="scale">
          <div className="callout-section cyber-card">
            <div className="callout-icon" aria-hidden="true">
              <Cpu size={32} />
            </div>
            <div className="callout-text">
              <div className="eyebrow-text">INITIALIZE YOUR PROTOCOL</div>
              <h2>Curiosity is your <span className="accent-text">superpower.</span></h2>
              <p>Every complex software system started with a single electric pulse. Start your challenge now.</p>
            </div>
            <button className="btn-primary btn-hacker-glow btn-click-fx" onClick={() => goTo('quiz')}>
              <span>Start Challenge</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Optional terminal boot sequence */}
      {booting && (
        <TerminalBoot onComplete={() => setBooting(false)} />
      )}

      {/* Multi-depth Binary Rain background with particles */}
      <BinaryRain />

      {/* Dark overlay for optimal text contrast */}
      <div className="rain-overlay" aria-hidden="true" />

      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <header className="topbar" role="banner">
        <button
          className="brand btn-click-fx"
          onClick={() => goTo('home')}
          aria-label="Binary Language Hub — go to home"
        >
          <span className="brand-mark" aria-hidden="true">
            <Terminal size={20} />
          </span>
          <span>
            <strong>BINARY<span className="brand-accent">LANGUAGE</span></strong>
            <small>CODE THE FUTURE_</small>
          </span>
        </button>

        {/* Desktop nav with animated active pill & indicator */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            className={`nav-link btn-click-fx ${active === 'home' ? 'active' : ''}`}
            onClick={() => goTo('home')}
          >
            <span>Home</span>
          </button>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-link btn-click-fx ${active === item.id ? 'active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="topbar-right">
          <span
            className={`score-chip ${scorePulsing ? 'score-pulse-active' : ''}`}
            aria-label={`Your score: ${score} points`}
          >
            <Zap size={13} aria-hidden="true" />
            <span>{score} pts</span>
          </span>
          <button className="top-cta btn-hacker-glow btn-click-fx" onClick={() => goTo('quiz')}>
            <Binary size={15} aria-hidden="true" />
            <span>Start Quiz</span>
          </button>
          {/* Hamburger */}
          <button
            className="mobile-menu-btn btn-click-fx"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <nav className="mobile-nav mobile-drawer-open" aria-label="Mobile navigation">
          {[{ id: 'home', label: 'Home' }, ...NAV_ITEMS].map((item, idx) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className={`btn-click-fx ${active === item.id ? 'active' : ''}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <span>{item.label}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ))}
        </nav>
      )}

      {/* ── Page content with smooth fade ──────────────────────────── */}
      <div className="page-content page-fade-enter" key={active}>
        <ErrorBoundary>
          {active === 'home' && HomePage}

          {active === 'translator' && (
            <BinaryTranslator onToast={showToast} />
          )}

          {active === 'quiz' && (
            <QuizSection onScoreUpdate={handleScoreUpdate} onToast={showToast} />
          )}

          {active === 'learn' && (
            <LessonsSection
              completedLessons={completedLessons}
              onComplete={handleLessonComplete}
              onToast={showToast}
            />
          )}
        </ErrorBoundary>
      </div>

      <Footer onNavigate={goTo} />

      {/* Toast notification */}
      <Toast
        message={toast.msg}
        type={toast.type}
        onClear={clearToast}
      />
    </div>
  );
}
