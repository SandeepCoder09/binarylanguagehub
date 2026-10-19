import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrainCircuit, Zap, Check, ChevronRight, RotateCcw,
  Trophy, Filter, Timer, BookOpen, X, Sparkles, Award,
} from 'lucide-react';
import { questions, CATEGORIES, DIFFICULTIES } from '../data/questions.js';

// ── Utility ─────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function safeNumber(raw, fallback = 0) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const ALL = 'All';
const TIMED_SECONDS = 30;
const POINTS_CORRECT = 10;

// Animated number counter for results screen
function AnimatedCounter({ target, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }
    let startTime = null;
    let animId = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease-out quart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(ease * target));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return <span>{count}</span>;
}

export default function QuizSection({ onScoreUpdate, onToast }) {
  // localStorage-backed stats
  const [bestScore, setBestScore] = useState(() =>
    safeNumber(localStorage.getItem('blh-quiz-best-score')));
  const [totalCompleted, setTotalCompleted] = useState(() =>
    safeNumber(localStorage.getItem('blh-quiz-total-completed')));

  // Setup phase
  const [phase, setPhase] = useState('setup'); // 'setup' | 'quiz' | 'results'
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedDifficulty, setSelectedDifficulty] = useState(ALL);
  const [mode, setMode] = useState('practice'); // 'practice' | 'timed'

  // Quiz phase
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMED_SECONDS);
  const [scorePulsing, setScorePulsing] = useState(false);
  const [recentEarned, setRecentEarned] = useState(null);
  const timerRef = useRef(null);

  const currentQ = questionQueue[currentIndex] ?? null;

  // Persist stats to localStorage
  useEffect(() => {
    localStorage.setItem('blh-quiz-best-score', String(bestScore));
  }, [bestScore]);
  useEffect(() => {
    localStorage.setItem('blh-quiz-total-completed', String(totalCompleted));
  }, [totalCompleted]);

  // Shuffle options when question changes
  useEffect(() => {
    if (currentQ) {
      setShuffledOptions(shuffle(currentQ.options));
    }
  }, [currentQ]);

  // Timer (timed mode only)
  useEffect(() => {
    if (phase !== 'quiz' || mode !== 'timed' || answered) return;

    setTimeLeft(TIMED_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setAnswered(true);
          setSelectedAnswer(null);
          setIncorrectCount(c => c + 1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, phase, mode, answered]);

  // ── Build queue ──────────────────────────────────────────────────────
  function startQuiz() {
    let pool = questions;
    if (selectedCategory !== ALL) pool = pool.filter(q => q.category === selectedCategory);
    if (selectedDifficulty !== ALL) pool = pool.filter(q => q.difficulty === selectedDifficulty);

    if (pool.length === 0) {
      onToast('No questions match those filters. Try different settings.', 'error');
      return;
    }

    setQuestionQueue(shuffle(pool));
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setPhase('quiz');
  }

  // ── Answer ───────────────────────────────────────────────────────────
  function submitAnswer(option) {
    if (answered || !currentQ) return;
    clearInterval(timerRef.current);

    const isCorrect = option === currentQ.answer;
    setSelectedAnswer(option);
    setAnswered(true);

    if (isCorrect) {
      const bonus = mode === 'timed' ? Math.floor(timeLeft / 3) : 0;
      const earned = POINTS_CORRECT + bonus;
      setScore(s => s + earned);
      setCorrectCount(c => c + 1);
      setRecentEarned(earned);
      setScorePulsing(true);
      setTimeout(() => setScorePulsing(false), 800);
      setTimeout(() => setRecentEarned(null), 1400);
      onScoreUpdate(earned);
    } else {
      setIncorrectCount(c => c + 1);
    }
  }

  // ── Next question ────────────────────────────────────────────────────
  function nextQuestion() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questionQueue.length) {
      finishQuiz();
    } else {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  }

  function finishQuiz() {
    clearInterval(timerRef.current);
    setPhase('results');
    const newTotal = totalCompleted + 1;
    setTotalCompleted(newTotal);
    if (score > bestScore) {
      setBestScore(score);
    }
    onToast('Quiz complete! Great run.', 'success');
  }

  function restart() {
    clearInterval(timerRef.current);
    setPhase('setup');
  }

  // ── Option class ─────────────────────────────────────────────────────
  function optionClass(option) {
    if (!answered) return 'answer-opt';
    if (option === currentQ.answer) return 'answer-opt correct pop-correct';
    if (option === selectedAnswer && option !== currentQ.answer) return 'answer-opt incorrect shake-incorrect';
    return 'answer-opt dimmed';
  }

  const progress = questionQueue.length
    ? ((currentIndex + (answered ? 1 : 0)) / questionQueue.length) * 100
    : 0;

  const categoryList = [ALL, ...Object.values(CATEGORIES)];
  const difficultyList = [ALL, ...Object.values(DIFFICULTIES)];

  // ════════════════════════════════════════════════════════════════════
  // SETUP PHASE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <main className="page-main section-wrap" id="quiz-page">
        <div className="page-title">
          <div className="eyebrow-row">
            <span className="pulse-dot" />
            <span className="eyebrow-text">QUIZ_ENGINE / VERIFICATION</span>
          </div>
          <h1>Terminal <span className="accent-text">Challenge.</span></h1>
          <p className="page-desc">
            Test your knowledge of binary, ASCII, logic circuits, and computing architecture.
            Earn points, beat your personal records, and level up.
          </p>
        </div>

        <div className="quiz-setup-grid">
          {/* Left: configuration */}
          <div className="setup-card cyber-card">
            <h2 className="setup-heading">
              <Filter size={18} aria-hidden="true" />
              <span>Configure Target Parameters</span>
            </h2>

            {/* Category */}
            <fieldset className="setup-fieldset">
              <legend>Category Focus</legend>
              <div className="filter-chips" role="group" aria-label="Category">
                {categoryList.map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip btn-click-fx ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Difficulty */}
            <fieldset className="setup-fieldset">
              <legend>Difficulty Level</legend>
              <div className="diff-buttons" role="group" aria-label="Difficulty">
                {difficultyList.map(d => (
                  <button
                    key={d}
                    className={`diff-btn diff-${d.toLowerCase()} btn-click-fx ${selectedDifficulty === d ? 'active' : ''}`}
                    onClick={() => setSelectedDifficulty(d)}
                    aria-pressed={selectedDifficulty === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Mode */}
            <fieldset className="setup-fieldset">
              <legend>Execution Mode</legend>
              <div className="mode-cards" role="group" aria-label="Quiz mode">
                <button
                  className={`mode-card btn-click-fx ${mode === 'practice' ? 'active' : ''}`}
                  onClick={() => setMode('practice')}
                  aria-pressed={mode === 'practice'}
                >
                  <BookOpen size={20} />
                  <strong>Practice Mode</strong>
                  <small>Untimed with instant explanations.</small>
                </button>
                <button
                  className={`mode-card btn-click-fx ${mode === 'timed' ? 'active' : ''}`}
                  onClick={() => setMode('timed')}
                  aria-pressed={mode === 'timed'}
                >
                  <Timer size={20} />
                  <strong>Timed Rush</strong>
                  <small>30s countdown with speed score multiplier.</small>
                </button>
              </div>
            </fieldset>

            <button className="btn-primary start-btn btn-hacker-glow btn-click-fx" onClick={startQuiz} id="btn-start-quiz">
              <Zap size={17} />
              <span>START CHALLENGE</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right: stats */}
          <aside className="stats-sidebar">
            <div className="stat-box cyber-card card-hover-lift">
              <Trophy size={28} className="stat-icon counter-glow" />
              <div className="eyebrow-text">ALL-TIME BEST</div>
              <div className="stat-big">{bestScore}</div>
            </div>
            <div className="stat-box cyber-card card-hover-lift">
              <BrainCircuit size={22} className="stat-icon-sm counter-glow" />
              <div className="eyebrow-text">CHALLENGES RUN</div>
              <div className="stat-big">{totalCompleted}</div>
            </div>
            <div className="stat-box cyber-card card-hover-lift">
              <Filter size={18} className="stat-icon-sm counter-glow" />
              <div className="eyebrow-text">QUESTION VAULT</div>
              <div className="stat-big">{questions.length}</div>
            </div>
            <p className="stat-note">
              Encrypted locally in browser localStorage.
            </p>
          </aside>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // RESULTS PHASE
  // ════════════════════════════════════════════════════════════════════
  if (phase === 'results') {
    const pct = questionQueue.length
      ? Math.round((correctCount / questionQueue.length) * 100)
      : 0;
    const gradeMsg =
      pct >= 90 ? '[ ELITE HACKER // S-TIER ]' :
      pct >= 70 ? '[ SKILLED CODER // A-TIER ]' :
      pct >= 50 ? '[ LEARNING FAST // B-TIER ]' :
                  '[ SYSTEM REBOOT RECOMMENDED ]';

    return (
      <main className="page-main section-wrap" id="quiz-results">
        <div className="results-card cyber-card reveal-box revealed">
          <div className="results-head">
            <div className="trophy-bounce-wrap">
              <Trophy size={48} className="results-trophy" />
            </div>
            <h1>Session Debrief</h1>
            <p className="grade-tag">{gradeMsg}</p>
          </div>

          <div className="results-stats">
            <div className="r-stat card-hover-lift">
              <span className="r-val">
                <AnimatedCounter target={score} />
              </span>
              <span className="r-label">TOTAL SCORE</span>
            </div>
            <div className="r-stat card-hover-lift">
              <span className="r-val accent">
                <AnimatedCounter target={pct} />%
              </span>
              <span className="r-label">ACCURACY</span>
            </div>
            <div className="r-stat card-hover-lift">
              <span className="r-val correct-color">
                <AnimatedCounter target={correctCount} />
              </span>
              <span className="r-label">CORRECT</span>
            </div>
            <div className="r-stat card-hover-lift">
              <span className="r-val error-color">
                <AnimatedCounter target={incorrectCount} />
              </span>
              <span className="r-label">INCORRECT</span>
            </div>
          </div>

          <div className="results-progress">
            <div className="progress-track">
              <span
                className="progress-fill animated-bar-fill"
                style={{ width: `${pct}%` }}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
                aria-label={`${pct}% correct`}
              />
            </div>
          </div>

          {score >= bestScore && score > 0 && (
            <p className="new-best animate-pulse-badge">
              <Award size={18} /> NEW HIGH SCORE ACHIEVED!
            </p>
          )}

          <div className="results-actions">
            <button className="btn-primary btn-hacker-glow btn-click-fx" onClick={startQuiz} id="btn-retry">
              <RotateCcw size={16} />
              <span>Retry Mission</span>
            </button>
            <button className="btn-secondary btn-hacker-glow btn-click-fx" onClick={restart} id="btn-new-quiz">
              <Filter size={16} />
              <span>Adjust Parameters</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // QUIZ PHASE
  // ════════════════════════════════════════════════════════════════════
  if (!currentQ) return null;

  return (
    <main className="page-main section-wrap" id="quiz-active">
      <div className="quiz-layout">
        {/* Main question card */}
        <div className="question-card cyber-card">
          {/* Animated progress bar */}
          <div
            className="quiz-progress-bar"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Question ${currentIndex + 1} of ${questionQueue.length}`}
          >
            <span
              className="quiz-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question header */}
          <div className="question-header">
            <div className="q-meta">
              <span className="q-badge category-badge">{currentQ.category}</span>
              <span className={`q-badge diff-badge diff-${currentQ.difficulty.toLowerCase()}`}>
                {currentQ.difficulty}
              </span>
            </div>
            <button className="icon-btn exit-btn btn-click-fx" onClick={restart} title="Exit quiz" aria-label="Exit quiz">
              <X size={18} />
            </button>
          </div>

          <div className="q-number">
            QUESTION {String(currentIndex + 1).padStart(2, '0')}
            <span> / {String(questionQueue.length).padStart(2, '0')}</span>
          </div>
          <h2 className="q-text">{currentQ.question}</h2>

          {/* Timed mode countdown bar */}
          {mode === 'timed' && !answered && (
            <div className={`timer-bar ${timeLeft <= 8 ? 'urgent' : ''}`} aria-live="polite">
              <Timer size={14} aria-hidden="true" />
              <span>{timeLeft}s</span>
              <div className="timer-track">
                <span
                  className="timer-fill"
                  style={{ width: `${(timeLeft / TIMED_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          )}
          {mode === 'timed' && answered && timeLeft === 0 && (
            <div className="timeout-msg" role="alert">⏱ TIME LIMIT EXCEEDED</div>
          )}

          {/* Answer options with animations */}
          <div className="answer-list" role="list">
            {shuffledOptions.map((option, i) => (
              <button
                key={option}
                className={`${optionClass(option)} btn-click-fx`}
                onClick={() => submitAnswer(option)}
                disabled={answered}
                role="listitem"
                aria-label={`Option ${String.fromCharCode(65 + i)}: ${option}`}
              >
                <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                <span className="answer-text">{option}</span>
                {answered && option === currentQ.answer && (
                  <Check size={16} className="answer-check" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* Feedback section with glowing transition */}
          {answered && (
            <div
              className={`answer-feedback ${selectedAnswer === currentQ.answer ? 'correct' : 'incorrect'} feedback-reveal`}
              role="alert"
              aria-live="assertive"
            >
              <div className="feedback-headline">
                <strong>
                  {selectedAnswer === null
                    ? "Time expired — correct vector identified below:"
                    : selectedAnswer === currentQ.answer
                      ? `Execution successful! +${POINTS_CORRECT} pts${mode === 'timed' ? ` (+${Math.floor(timeLeft / 3)} bonus)` : ''}`
                      : 'Syntax mismatch — review analysis:'}
                </strong>
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="question-footer">
            <div className="score-inline-wrap">
              <span className={`score-inline ${scorePulsing ? 'score-pulse-active' : ''}`}>
                <Zap size={14} aria-hidden="true" />
                <span>{score} pts</span>
              </span>
              {recentEarned && (
                <span className="floating-points-badge">+{recentEarned}</span>
              )}
            </div>

            {answered && (
              <button className="btn-primary btn-hacker-glow btn-click-fx" onClick={nextQuestion} id="btn-next-q">
                <span>{currentIndex + 1 >= questionQueue.length ? 'Finalize & View Results' : 'Next Vector'}</span>
                <ChevronRight size={16} />
              </button>
            )}
            {!answered && (
              <span className="muted-text small-text">Select a node to continue</span>
            )}
          </div>
        </div>

        {/* Score sidebar */}
        <aside className="quiz-sidebar cyber-card">
          <div className="sidebar-score">
            <Trophy size={22} className="stat-icon-sm counter-glow" />
            <div className="eyebrow-text">LIVE SCORE</div>
            <div className={`stat-big ${scorePulsing ? 'score-pulse-active' : ''}`}>{score}</div>
          </div>
          <div className="sidebar-row">
            <span>Progress</span>
            <strong>{currentIndex + 1} / {questionQueue.length}</strong>
          </div>
          <div className="sidebar-row correct-color">
            <span>Correct</span>
            <strong>{correctCount}</strong>
          </div>
          <div className="sidebar-row error-color">
            <span>Incorrect</span>
            <strong>{incorrectCount}</strong>
          </div>
          <div className="sidebar-row">
            <span>High score</span>
            <strong>{bestScore}</strong>
          </div>
          <button className="reset-btn btn-click-fx" onClick={restart}>
            <RotateCcw size={13} /> Exit to Menu
          </button>
        </aside>
      </div>
    </main>
  );
}
