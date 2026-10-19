import { useState, useMemo } from 'react';
import {
  Binary, BookOpen, ArrowRight, ArrowLeft, Plus, Minus,
  Globe, GitBranch, Code2, HardDrive, Zap, ShieldCheck,
  Search, Check, ChevronRight, Lock, Cpu, Sparkles, BrainCircuit,
} from 'lucide-react';
import { lessons, LEVELS } from '../data/lessons.js';

const ICON_MAP = {
  Binary, BookOpen, ArrowRight, ArrowLeft, Plus, Minus,
  Globe, GitBranch, Code2, HardDrive, Zap, ShieldCheck, Cpu,
};

const LEVEL_LABELS = {
  1: 'BEGINNER',
  2: 'INTERMEDIATE',
  3: 'ADVANCED',
};
const LEVEL_COLORS = {
  1: 'level-beginner',
  2: 'level-intermediate',
  3: 'level-advanced',
};

export default function LessonsSection({ completedLessons, onComplete, onToast }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [levelFilter, setLevelFilter] = useState(0); // 0 = all
  const [practiceAnswers, setPracticeAnswers] = useState({}); // lessonId → selected option
  const [practiceShown, setPracticeShown] = useState({}); // lessonId → bool

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lessons.filter(lesson => {
      const matchText =
        `${lesson.title} ${lesson.tag} ${lesson.body} ${lesson.example}`
          .toLowerCase()
          .includes(q);
      const matchLevel = levelFilter === 0 || lesson.level === levelFilter;
      return matchText && matchLevel;
    });
  }, [search, levelFilter]);

  function toggleLesson(id) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  function markComplete(lesson) {
    if (completedLessons.includes(lesson.id)) return;
    onComplete(lesson.id);
    onToast(`Module "${lesson.title}" marked as completed!`, 'success');
  }

  function submitPractice(lesson, option) {
    if (practiceAnswers[lesson.id]) return;
    setPracticeAnswers(prev => ({ ...prev, [lesson.id]: option }));
  }

  function togglePractice(id) {
    setPracticeShown(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Progress per level
  const byLevel = lessons.reduce((acc, l) => {
    acc[l.level] = acc[l.level] || [];
    acc[l.level].push(l);
    return acc;
  }, {});

  return (
    <main className="page-main section-wrap" id="lessons-page">
      {/* Page header */}
      <div className="page-title">
        <div className="eyebrow-row">
          <span className="pulse-dot" />
          <span className="eyebrow-text">CURRICULUM // REPOSITORIES</span>
        </div>
        <h1>Learn the <span className="accent-text">Fundamentals.</span></h1>
        <p className="page-desc">
          Step-by-step interactive syllabus covering binary calculations, ASCII character maps, Boolean logic gates, and hardware fundamentals.
          Progress is automatically synchronized to your local machine.
        </p>
      </div>

      {/* Level progress cards */}
      <div className="level-cards">
        {[1, 2, 3].map(lvl => {
          const total = (byLevel[lvl] || []).length;
          const done = (byLevel[lvl] || []).filter(l => completedLessons.includes(l.id)).length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <button
              key={lvl}
              className={`level-card cyber-card card-hover-lift btn-click-fx ${levelFilter === lvl ? 'active' : ''} ${LEVEL_COLORS[lvl]}`}
              onClick={() => setLevelFilter(prev => prev === lvl ? 0 : lvl)}
              aria-pressed={levelFilter === lvl}
            >
              <div className="level-card-top">
                <span className="level-badge">{LEVEL_LABELS[lvl]}</span>
                {lvl > 1 && <Lock size={12} className="level-lock" aria-label="Higher level" />}
              </div>
              <div className="level-name">{LEVELS[lvl]}</div>
              <div className="level-progress-track">
                <span className="level-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="level-stats">{done}/{total} completed ({pct}%)</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="lesson-toolbar">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules, concepts, or tags…"
            aria-label="Search lessons"
            id="lesson-search"
            className="hacker-input"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >×</button>
          )}
        </div>
        <span className="lesson-count" aria-live="polite">
          {filtered.length} / {lessons.length} MODULE{filtered.length !== 1 ? 'S' : ''} ACTIVE
        </span>
      </div>

      {/* Lesson list */}
      <div className="lesson-list" role="list">
        {filtered.map(lesson => {
          const Icon = ICON_MAP[lesson.icon] || BookOpen;
          const isOpen = expandedId === lesson.id;
          const isDone = completedLessons.includes(lesson.id);
          const practiced = !!practiceAnswers[lesson.id];
          const practiceVisible = !!practiceShown[lesson.id];

          return (
            <article
              key={lesson.id}
              className={`lesson-card cyber-card card-hover-lift ${isOpen ? 'expanded' : ''} ${isDone ? 'done' : ''}`}
              role="listitem"
            >
              {/* Summary row (accordion toggle) */}
              <button
                className="lesson-summary btn-click-fx"
                onClick={() => toggleLesson(lesson.id)}
                aria-expanded={isOpen}
                aria-controls={`lesson-body-${lesson.id}`}
              >
                <span className="lesson-icon-wrap">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="lesson-title-group">
                  <small className="lesson-meta">
                    <span className={`level-pip ${LEVEL_COLORS[lesson.level]}`}>
                      {LEVEL_LABELS[lesson.level]}
                    </span>
                    {' · '}{lesson.tag}{' · '}{lesson.time.toUpperCase()}
                  </small>
                  <strong className="lesson-title">{lesson.title}</strong>
                </span>
                <span className={`lesson-check-icon ${isDone ? 'done' : ''}`} aria-hidden="true">
                  {isDone ? <Check size={16} /> : <ChevronRight size={18} />}
                </span>
              </button>

              {/* Lesson body */}
              {isOpen && (
                <div
                  className="lesson-body accordion-fade"
                  id={`lesson-body-${lesson.id}`}
                >
                  <p className="lesson-text">{lesson.body}</p>

                  <div className="example-box cyber-card">
                    <span className="example-label">CODE_SAMPLE // REPL</span>
                    <pre className="example-text">{lesson.example}</pre>
                  </div>

                  {/* Practice question */}
                  {lesson.practice && (
                    <div className="practice-section">
                      <button
                        className="practice-toggle btn-click-fx"
                        onClick={() => togglePractice(lesson.id)}
                        aria-expanded={practiceVisible}
                      >
                        <BrainCircuit size={15} aria-hidden="true" />
                        <span>{practiceVisible ? 'Collapse' : 'Execute'} Verification Drill</span>
                      </button>

                      {practiceVisible && (
                        <div className="practice-q feedback-reveal">
                          <p className="practice-question">{lesson.practice.question}</p>
                          <div className="practice-options">
                            {lesson.practice.options.map((opt, i) => {
                              const selected = practiceAnswers[lesson.id];
                              let cls = 'practice-opt btn-click-fx';
                              if (selected) {
                                if (opt === lesson.practice.answer) cls += ' correct pop-correct';
                                else if (opt === selected) cls += ' incorrect shake-incorrect';
                                else cls += ' dimmed';
                              }
                              return (
                                <button
                                  key={opt}
                                  className={cls}
                                  onClick={() => submitPractice(lesson, opt)}
                                  disabled={!!selected}
                                  aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                                >
                                  <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                                  <span>{opt}</span>
                                  {selected && opt === lesson.practice.answer && (
                                    <Check size={14} aria-hidden="true" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {practiced && (
                            <div
                              className={`practice-feedback ${practiceAnswers[lesson.id] === lesson.practice.answer ? 'correct' : 'incorrect'} feedback-reveal`}
                              role="alert"
                            >
                              <strong>
                                {practiceAnswers[lesson.id] === lesson.practice.answer
                                  ? 'Verification Confirmed!'
                                  : 'Checksum Failed.'}
                              </strong>
                              {' '}{lesson.practice.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mark complete button */}
                  <div className="lesson-footer">
                    <button
                      className={`complete-btn btn-hacker-glow btn-click-fx ${isDone ? 'completed' : ''}`}
                      onClick={() => markComplete(lesson)}
                      disabled={isDone}
                      id={`btn-complete-${lesson.id}`}
                    >
                      <Check size={15} aria-hidden="true" />
                      <span>{isDone ? 'Module Mastered' : 'Mark as Complete'}</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
