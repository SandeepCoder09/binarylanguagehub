import { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Zap } from 'lucide-react';

export default function TerminalBoot({ onComplete }) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion or already booted, skip immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }

    const t1 = setTimeout(() => setStep(1), 120);
    const t2 = setTimeout(() => setStep(2), 260);
    const t3 = setTimeout(() => setStep(3), 420);
    const t4 = setTimeout(() => setStep(4), 580);
    const tEnd = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        try {
          sessionStorage.setItem('blh_booted', '1');
        } catch (_) {}
        onComplete?.();
      }, 250);
    }, 850);

    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tEnd);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onComplete]);

  function dismiss() {
    setFading(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem('blh_booted', '1');
      } catch (_) {}
      onComplete?.();
    }, 150);
  }

  return (
    <div
      className={`boot-screen ${fading ? 'boot-screen-fade' : ''}`}
      onClick={dismiss}
      role="dialog"
      aria-label="System Initializing"
      aria-modal="true"
    >
      <div className="boot-terminal-box" onClick={(e) => e.stopPropagation()}>
        <div className="boot-header">
          <div className="boot-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span className="boot-title">
            <Terminal size={14} aria-hidden="true" />
            BLH-OS // BOOT_SEQUENCE
          </span>
          <button className="boot-skip-btn" onClick={dismiss} aria-label="Skip boot sequence">
            SKIP [ESC]
          </button>
        </div>

        <div className="boot-body font-mono">
          <div className={`boot-line ${step >= 0 ? 'visible' : ''}`}>
            <span className="text-dim">[0.001]</span> CORE_INIT: Initializing binary architecture...
          </div>
          <div className={`boot-line ${step >= 1 ? 'visible' : ''}`}>
            <span className="text-dim">[0.024]</span> MEMORY: 64-bit address registers mounted <span className="text-green">[OK]</span>
          </div>
          <div className={`boot-line ${step >= 2 ? 'visible' : ''}`}>
            <span className="text-dim">[0.052]</span> MODULES: Translator, Quiz Engine, 12 Lessons <span className="text-green">[READY]</span>
          </div>
          <div className={`boot-line ${step >= 3 ? 'visible' : ''}`}>
            <span className="text-dim">[0.088]</span> SECURITY: Local browser storage sandbox <span className="text-cyan">[SECURE]</span>
          </div>
          <div className={`boot-line boot-line-success ${step >= 4 ? 'visible' : ''}`}>
            <span className="text-green">✓ SYSTEM ONLINE</span> // Welcome, Developer<span className="terminal-cursor">_</span>
          </div>
        </div>

        <div className="boot-bar-container">
          <div className="boot-bar-fill" style={{ width: `${Math.min(100, step * 25)}%` }} />
        </div>
      </div>
    </div>
  );
}
