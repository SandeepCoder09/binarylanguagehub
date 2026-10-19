import { useEffect, useRef, useState } from 'react';
import { Binary, BookOpen, Zap, ChevronRight, Terminal, Sparkles, Activity } from 'lucide-react';

const MESSAGES = [
  'Initializing system...',
  'Loading binary modules...',
  'Decoding 0s and 1s in real-time...',
  'System ready.',
  'Welcome, developer. Code the future_',
];

export default function HeroSection({ score, totalLessons, totalQuestions, onNavigate }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const charRef = useRef(0);
  const timerRef = useRef(null);

  // Terminal typing animation with natural cadence
  useEffect(() => {
    const currentMsg = MESSAGES[msgIndex];
    charRef.current = 0;
    setDisplayed('');
    setTyping(true);

    function typeNext() {
      charRef.current += 1;
      setDisplayed(currentMsg.slice(0, charRef.current));
      if (charRef.current < currentMsg.length) {
        timerRef.current = setTimeout(typeNext, 28 + Math.random() * 24);
      } else {
        setTyping(false);
        timerRef.current = setTimeout(() => {
          setMsgIndex(i => (i + 1) % MESSAGES.length);
        }, 2400);
      }
    }

    timerRef.current = setTimeout(typeNext, 280);
    return () => clearTimeout(timerRef.current);
  }, [msgIndex]);

  return (
    <section className="hero-section section-wrap" aria-label="Hero">
      <div className="hero-content">
        {/* Eyebrow */}
        <div className="eyebrow-row">
          <span className="pulse-dot" aria-hidden="true" />
          <span className="eyebrow-text">SYSTEM ONLINE // CORE v2.4</span>
          <span className="eyebrow-line" aria-hidden="true" />
        </div>

        {/* Main headline with layered hacker glitch */}
        <h1 className="hero-title glitch-wrapper" aria-label="Binary Language — Decode the digital world. One bit at a time.">
          <span className="glitch-text" data-text="BINARY">BINARY</span>
          <br />
          <span className="hero-title-accent glitch-text" data-text="LANGUAGE">LANGUAGE</span>
        </h1>

        <p className="hero-subtitle">
          Decode the digital world.<br className="hero-break" />
          <span className="accent-text">One bit at a time.</span>
        </p>

        {/* Animated terminal line */}
        <div className="hero-terminal" aria-live="polite" aria-atomic="true">
          <div className="terminal-prefix">
            <span className="terminal-prompt">root@blh</span>
            <span className="terminal-sep">:~$</span>
          </div>
          <div className="terminal-content">
            <span className="terminal-msg">{displayed}</span>
            <span className="terminal-cursor" aria-hidden="true">_</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="hero-actions">
          <button
            className="btn-primary btn-hacker-glow"
            onClick={() => onNavigate('learn')}
            id="cta-learn"
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>START LEARNING</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
          <button
            className="btn-secondary btn-hacker-glow"
            onClick={() => onNavigate('translator')}
            id="cta-lab"
          >
            <Binary size={17} aria-hidden="true" />
            <span>OPEN BINARY LAB</span>
          </button>
          <button
            className="btn-ghost btn-hacker-glow"
            onClick={() => onNavigate('quiz')}
            id="cta-quiz"
          >
            <Zap size={16} aria-hidden="true" />
            <span>TEST YOUR SKILLS</span>
          </button>
        </div>

        {/* Live stats */}
        <div className="hero-stats" aria-label="Platform statistics">
          <div className="stat-item card-hover-lift">
            <span className="stat-value counter-glow">{totalLessons}</span>
            <span className="stat-label">LESSONS</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-item card-hover-lift">
            <span className="stat-value counter-glow">{totalQuestions}</span>
            <span className="stat-label">QUIZ QUESTIONS</span>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-item card-hover-lift">
            <span className="stat-value counter-glow">{score}</span>
            <span className="stat-label">YOUR SCORE</span>
          </div>
        </div>
      </div>

      {/* Terminal card visual with animated scanline and floating chips */}
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-visual-glow" />
        <div className="terminal-card cyber-card">
          <div className="terminal-scanline" />
          <div className="terminal-card-head">
            <div className="tc-dots">
              <span className="tc-dot tc-red" />
              <span className="tc-dot tc-yellow" />
              <span className="tc-dot tc-green" />
            </div>
            <small className="tc-title">
              <Terminal size={13} /> binary-core.sh
            </small>
            <span className="tc-badge">ACTIVE</span>
          </div>
          <div className="terminal-card-body">
            <p><span className="tc-prompt">root@blh</span>:~$ <span className="tc-cmd">./run_diagnostics.sh</span></p>
            <p className="tc-dim">[SYS] Checking binary matrix bus...</p>
            <p><span className="tc-green">✓</span> <span className="tc-name">Binary translator</span> <span className="tc-tag">[ACTIVE / REALTIME]</span></p>
            <p><span className="tc-green">✓</span> <span className="tc-name">Interactive quiz engine</span> <span className="tc-tag">[{totalQuestions} questions]</span></p>
            <p><span className="tc-green">✓</span> <span className="tc-name">Knowledge curriculum</span> <span className="tc-tag">[{totalLessons} lessons ready]</span></p>
            <p><span className="tc-green">✓</span> <span className="tc-name">Local storage cache</span> <span className="tc-tag">[SYNCED]</span></p>
            <p className="tc-ready">
              <span className="tc-pulse">●</span> All systems operational<span className="terminal-cursor">_</span>
            </p>
          </div>
          <div className="terminal-card-foot">
            <span className="tc-foot-item"><span className="tc-foot-label">PORT:</span> 5173</span>
            <span className="tc-foot-item"><span className="tc-foot-label">PROTO:</span> BASE-2</span>
            <span className="tc-foot-item tc-foot-active"><span className="tc-foot-dot" /> SECURE</span>
          </div>
        </div>

        <div className="floating-chip chip-one">
          <Binary size={15} />
          <span>01001000 01101001</span>
        </div>
        <div className="floating-chip chip-two">
          <Activity size={14} />
          <span>LATENCY: 0.1ms</span>
        </div>
      </div>
    </section>
  );
}
