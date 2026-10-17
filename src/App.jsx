import { useEffect, useMemo, useState } from 'react'
import {
  Binary, Terminal, Code2, BrainCircuit, BookOpen, ShieldCheck, Copy,
  ArrowLeftRight, Check, Zap, Menu, X, ChevronRight, RotateCcw, Trophy,
  Search, ExternalLink, Github, Instagram, Sparkles, CircleHelp
} from 'lucide-react'

const challenges = [
  { level: 'BEGINNER', question: 'What character does 01000001 represent in ASCII?', options: ['A', 'B', 'a', '1'], answer: 'A', explanation: '01000001 is decimal 65, which is uppercase A in ASCII.' },
  { level: 'BEGINNER', question: 'How many bits are in one byte?', options: ['4', '8', '16', '10'], answer: '8', explanation: 'A byte contains 8 bits. Each bit is either 0 or 1.' },
  { level: 'INTERMEDIATE', question: 'What is the binary representation of decimal 5?', options: ['101', '110', '100', '111'], answer: '101', explanation: '5 = 4 + 1, so its binary representation is 101.' },
  { level: 'INTERMEDIATE', question: 'Which number system uses only 0 and 1?', options: ['Decimal', 'Hexadecimal', 'Binary', 'Octal'], answer: 'Binary', explanation: 'Binary is base-2 and uses only the digits 0 and 1.' },
  { level: 'BEGINNER', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Utility', 'Core Program Upload', 'Central Print Unit'], answer: 'Central Processing Unit', explanation: 'The CPU executes instructions and coordinates many computer operations.' },
]
const lessons = [
  { title: 'Binary basics', tag: 'FOUNDATION', icon: Binary, time: '4 min', body: 'Binary is a base-2 number system. Each digit is a bit and can be 0 or 1. Place values move in powers of two: 1, 2, 4, 8, 16, 32, 64, 128.', example: 'Decimal 13 = 8 + 4 + 1 = binary 1101.' },
  { title: 'ASCII & text', tag: 'ENCODING', icon: BookOpen, time: '5 min', body: 'Computers store text using character encodings. ASCII assigns numbers to common English letters, digits, and symbols. An 8-bit view can represent values from 0 to 255, though classic ASCII uses 7 bits.', example: 'Uppercase A is decimal 65, shown as 01000001 in 8-bit binary.' },
  { title: 'Web development', tag: 'BUILD', icon: Code2, time: '6 min', body: 'Websites combine HTML for structure, CSS for appearance, and JavaScript for behavior. React helps build interfaces from reusable components.', example: 'Build a small project, test it on mobile, then publish it with a static host.' },
  { title: 'Cyber safety', tag: 'STAY SAFE', icon: ShieldCheck, time: '4 min', body: 'Learn defensive security: use unique passwords, enable multi-factor authentication, update software, and only test systems you own or have explicit permission to assess.', example: 'Practice security concepts in legal training labs, never on someone else’s accounts or devices.' },
]
const navItems = [
  { id: 'translator', label: 'Translator', icon: ArrowLeftRight },
  { id: 'challenge', label: 'Daily challenge', icon: BrainCircuit },
  { id: 'learn', label: 'Learn', icon: BookOpen },
]

function toBinary(text) {
  return [...text].map(char => char.codePointAt(0).toString(2).padStart(8, '0')).join(' ')
}
function fromBinary(input) {
  const clean = input.trim()
  if (!clean) return ''
  const groups = clean.split(/[\s,]+/)
  if (groups.some(group => !/^[01]{1,21}$/.test(group))) throw new Error('Use binary digits (0 and 1), separated by spaces.')
  return groups.map(group => String.fromCodePoint(parseInt(group, 2))).join('')
}
function App() {
  const [active, setActive] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [mode, setMode] = useState('toBinary')
  const [textInput, setTextInput] = useState('Hello, world!')
  const [binaryInput, setBinaryInput] = useState('01001000 01100101 01101100 01101100 01101111')
  const [result, setResult] = useState('01001000 01100101 01101100 01101100 01101111 00101100 00100000 01110111 01101111 01110010 01101100 01100100 00100001')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(() => Number(localStorage.getItem('blh-score') || 0))
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('blh-completed') || '[]'))
  const [search, setSearch] = useState('')
  const [expandedLesson, setExpandedLesson] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem('blh-score', String(score)) }, [score])
  useEffect(() => { localStorage.setItem('blh-completed', JSON.stringify(completed)) }, [completed])

  const currentChallenge = challenges[challengeIndex % challenges.length]
  const filteredLessons = useMemo(() => lessons.filter(lesson => `${lesson.title} ${lesson.tag} ${lesson.body}`.toLowerCase().includes(search.toLowerCase())), [search])

  function runConvert() {
    setError('')
    try {
      const output = mode === 'toBinary' ? toBinary(textInput) : fromBinary(binaryInput)
      setResult(output || '(empty result)')
    } catch (err) { setError(err.message); setResult('') }
  }
  function copyResult() {
    if (!result || result === '(empty result)') return
    navigator.clipboard?.writeText(result).then(() => {
      setCopied(true); setToast('Copied to clipboard!')
      setTimeout(() => { setCopied(false); setToast('') }, 1800)
    }).catch(() => setToast('Select and copy the result manually.'))
  }
  function selectMode(next) {
    setMode(next); setError('')
    if (next === 'toBinary') setResult(toBinary(textInput))
    else {
      try { setResult(fromBinary(binaryInput)) } catch { setResult('') }
    }
  }
  function submitAnswer(option) {
    if (answered) return
    setAnswer(option); setAnswered(true)
    if (option === currentChallenge.answer) setScore(value => value + 10)
  }
  function nextChallenge() {
    setChallengeIndex(value => (value + 1) % challenges.length)
    setAnswer(''); setAnswered(false)
  }
  function markComplete(index) {
    if (!completed.includes(index)) setCompleted(value => [...value, index])
  }
  function goTo(id) { setActive(id); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="app-shell">
      <div className="matrix-glow" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => goTo('home')} aria-label="Binary Language home">
          <span className="brand-mark"><Terminal size={21} /></span>
          <span><strong>BINARY<span>LANGUAGE</span></strong><small>CODE THE FUTURE_</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button className={active === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => goTo('home')}>Home</button>
          {navItems.map(item => <button key={item.id} className={active === item.id ? 'nav-link active' : 'nav-link'} onClick={() => goTo(item.id)}>{item.label}</button>)}
        </nav>
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">{mobileNav ? <X /> : <Menu />}</button>
        <button className="top-cta" onClick={() => goTo('challenge')}><Zap size={16} /> Start learning</button>
      </header>
      {mobileNav && <nav className="mobile-nav">{[{id:'home',label:'Home'}, ...navItems].map(item => <button key={item.id} onClick={() => goTo(item.id)}>{item.label}<ChevronRight size={16}/></button>)}</nav>}

      {active === 'home' && <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot"/> SYSTEM ONLINE <span className="eyebrow-line"/></div>
            <h1>THINK IN <span>BINARY.</span><br/>BUILD THE <span>FUTURE.</span></h1>
            <p className="hero-description">Your digital playground for binary code, programming basics, and daily brain-training challenges.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={() => goTo('translator')}><Binary size={18}/> Try the translator <ChevronRight size={17}/></button>
              <button className="button-secondary" onClick={() => goTo('learn')}><BookOpen size={17}/> Explore lessons</button>
            </div>
            <div className="hero-metrics">
              <div><strong>01</strong><span>LEARN BY DOING</span></div><div><strong>0/1</strong><span>START WITH BASICS</span></div><div><strong>∞</strong><span>ROOM TO GROW</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="scanline"/>
            <div className="visual-top"><span><span className="status-dot"/> LIVE TERMINAL</span><span>BLH_v1.0</span></div>
            <div className="binary-rain" aria-hidden="true">01001010<br/>10110101<br/>01001101<br/>11001010<br/>00110101<br/>10101001<br/>01010110</div>
            <div className="terminal-card">
              <div className="terminal-head"><span/><span/><span/><small>binary-language.sh</small></div>
              <div className="terminal-body"><p><span className="prompt">guest@blh</span>:~$ initialize_learning</p><p className="green">Loading curiosity modules...</p><p><span className="green">✓</span> Binary translator</p><p><span className="green">✓</span> Daily challenges</p><p><span className="green">✓</span> Learning library</p><p className="terminal-ready">All systems ready<span className="cursor">_</span></p></div>
            </div>
            <div className="floating-chip chip-one"><Binary size={17}/><span>01001000 01101001</span></div>
            <div className="floating-chip chip-two"><Sparkles size={16}/><span>KEEP BUILDING</span></div>
          </div>
        </section>

        <section className="section-wrap feature-section">
          <div className="section-heading"><div><div className="eyebrow">YOUR TOOLKIT</div><h2>Explore the <span>system.</span></h2></div><p>Small steps. Real skills. One line of code at a time.</p></div>
          <div className="feature-grid">
            <Feature icon={ArrowLeftRight} number="01" title="Binary translator" description="Turn text into 0s and 1s, then decode binary back into readable text." action="Open translator" onClick={() => goTo('translator')}/>
            <Feature icon={BrainCircuit} number="02" title="Daily challenge" description="Test your tech knowledge, earn points, and keep sharpening your mind." action="Take a challenge" onClick={() => goTo('challenge')}/>
            <Feature icon={BookOpen} number="03" title="Learning library" description="Understand binary, ASCII, web development, and safer computing." action="Browse lessons" onClick={() => goTo('learn')}/>
          </div>
        </section>
        <section className="section-wrap callout"><div className="callout-icon"><Code2 size={27}/></div><div><div className="eyebrow">YOUR NEXT COMMIT STARTS HERE</div><h2>Curiosity is your <span>superpower.</span></h2><p>Learn something today. Build something tomorrow.</p></div><button className="button-primary" onClick={() => goTo('challenge')}>Start a challenge <ChevronRight size={17}/></button></section>
      </main>}

      {active === 'translator' && <main className="page-main section-wrap">
        <PageTitle eyebrow="TOOL_001 / ENCODING" title={<>Binary <span>translator.</span></>} description="Translate readable text into binary code or decode binary back into text. Runs locally in your browser."/>
        <div className="tool-panel">
          <div className="tool-panel-top"><div className="window-dots"><i/><i/><i/></div><span>translator.exe</span><span className="live-label"><span className="status-dot"/> READY</span></div>
          <div className="mode-switch"><button className={mode === 'toBinary' ? 'mode-active' : ''} onClick={() => selectMode('toBinary')}><Code2 size={16}/> Text → Binary</button><button className={mode === 'fromBinary' ? 'mode-active' : ''} onClick={() => selectMode('fromBinary')}><Binary size={16}/> Binary → Text</button></div>
          <div className="translator-grid">
            <div className="field-group"><label htmlFor="source-input">{mode === 'toBinary' ? 'INPUT TEXT' : 'BINARY INPUT'}</label><textarea id="source-input" value={mode === 'toBinary' ? textInput : binaryInput} onChange={e => mode === 'toBinary' ? setTextInput(e.target.value) : setBinaryInput(e.target.value)} placeholder={mode === 'toBinary' ? 'Type a message...' : '01001000 01101001'} spellCheck="false"/><div className="field-hint">{mode === 'toBinary' ? `${textInput.length} characters` : 'Separate binary bytes with spaces'}</div></div>
            <div className="translate-arrow"><ArrowLeftRight size={22}/></div>
            <div className="field-group"><label htmlFor="result-output">OUTPUT RESULT</label><div id="result-output" className="result-box">{result || <span className="muted">Your result will appear here...</span>}</div><div className="field-hint">{result && result !== '(empty result)' ? `${result.length} characters` : 'Waiting for input'}</div></div>
          </div>
          {error && <div className="error-message"><CircleHelp size={16}/>{error}</div>}
          <div className="tool-actions"><button className="button-primary" onClick={runConvert}><Zap size={16}/> Convert now</button><button className="button-secondary" onClick={copyResult}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied!' : 'Copy result'}</button><button className="icon-button" title="Reset" onClick={() => {setTextInput('');setBinaryInput('');setResult('');setError('')}}><RotateCcw size={16}/></button></div>
          <p className="tool-note"><ShieldCheck size={15}/> Your input stays in this browser. Nothing is sent to a server.</p>
        </div>
        <div className="info-strip"><Binary/><div><strong>Quick fact</strong><p>Binary is a base-2 number system. Each digit is a bit: either 0 or 1. Text encoding depends on the character encoding used.</p></div></div>
      </main>}

      {active === 'challenge' && <main className="page-main section-wrap">
        <PageTitle eyebrow="TRAINING_MODE / DAILY" title={<>Daily <span>challenge.</span></>} description="One quick question to train your tech brain. Choose an answer and learn from the explanation."/>
        <div className="challenge-layout">
          <div className="challenge-card">
            <div className="challenge-top"><span className="challenge-label"><BrainCircuit size={16}/> KNOWLEDGE CHECK</span><span className="level-tag">{currentChallenge.level}</span></div>
            <div className="challenge-progress"><span style={{width: `${((challengeIndex % challenges.length)+1)/challenges.length*100}%`}}/></div>
            <div className="question-number">QUESTION {String((challengeIndex % challenges.length)+1).padStart(2,'0')} <span>/ {String(challenges.length).padStart(2,'0')}</span></div>
            <h2>{currentChallenge.question}</h2>
            <div className="answer-list">{currentChallenge.options.map((option, index) => <button key={option} disabled={answered} className={`answer-option ${answered && option === currentChallenge.answer ? 'correct' : ''} ${answered && answer === option && option !== currentChallenge.answer ? 'incorrect' : ''}`} onClick={() => submitAnswer(option)}><span className="answer-letter">{String.fromCharCode(65+index)}</span>{option}{answered && option === currentChallenge.answer && <Check size={17}/>}</button>)}</div>
            {answered && <div className={answer === currentChallenge.answer ? 'answer-feedback success' : 'answer-feedback'}><strong>{answer === currentChallenge.answer ? 'Correct! +10 points' : 'Not quite — keep learning.'}</strong><p>{currentChallenge.explanation}</p></div>}
            <div className="challenge-footer"><span><Zap size={16}/> {score} TOTAL POINTS</span>{answered ? <button className="button-primary" onClick={nextChallenge}>Next question <ChevronRight size={16}/></button> : <span className="muted small">Select one answer to continue</span>}</div>
          </div>
          <aside className="score-card"><div className="score-icon"><Trophy size={25}/></div><div className="eyebrow">YOUR PROGRESS</div><strong className="score-number">{score}</strong><span className="score-caption">TOTAL POINTS</span><div className="score-divider"/><div className="score-row"><span>Questions in this set</span><strong>{challenges.length}</strong></div><div className="score-row"><span>Points per correct answer</span><strong>+10</strong></div><p className="score-footnote">Your score is saved on this device.</p><button className="reset-score" onClick={() => {setScore(0);setChallengeIndex(0);setAnswer('');setAnswered(false)}}><RotateCcw size={14}/> Reset progress</button></aside>
        </div>
      </main>}

      {active === 'learn' && <main className="page-main section-wrap">
        <PageTitle eyebrow="KNOWLEDGE_BASE / 001" title={<>Learn the <span>fundamentals.</span></>} description="Short, beginner-friendly guides to help you understand the systems behind your screen."/>
        <div className="lesson-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons..." aria-label="Search lessons"/></div><span>{filteredLessons.length} MODULES FOUND</span></div>
        <div className="lesson-list">{filteredLessons.map(lesson => { const originalIndex = lessons.indexOf(lesson); const Icon = lesson.icon; const isExpanded = expandedLesson === originalIndex; return <article className={`lesson-card ${isExpanded ? 'expanded' : ''}`} key={lesson.title}><button className="lesson-summary" onClick={() => setExpandedLesson(isExpanded ? -1 : originalIndex)}><span className="lesson-icon"><Icon size={22}/></span><span className="lesson-title-group"><small>{lesson.tag} · {lesson.time.toUpperCase()}</small><strong>{lesson.title}</strong></span><span className={`lesson-check ${completed.includes(originalIndex) ? 'done' : ''}`}>{completed.includes(originalIndex) ? <Check size={16}/> : <ChevronRight size={18}/>}</span></button>{isExpanded && <div className="lesson-content"><p>{lesson.body}</p><div className="example-box"><span>EXAMPLE_</span><p>{lesson.example}</p></div><button className="button-secondary" onClick={() => markComplete(originalIndex)}>{completed.includes(originalIndex) ? <Check size={16}/> : <BookOpen size={16}/>} {completed.includes(originalIndex) ? 'Module completed' : 'Mark as completed'}</button></div>}</article>})}{filteredLessons.length === 0 && <div className="empty-state">No modules match that search. Try “binary”, “web”, or “safety”.</div>}</div>
        <div className="learning-progress"><div><span className="eyebrow">YOUR LEARNING PATH</span><strong>{completed.length} / {lessons.length} modules completed</strong></div><div className="progress-track"><span style={{width: `${completed.length/lessons.length*100}%`}}/></div></div>
      </main>}

      <footer className="footer"><div className="footer-brand"><span className="brand-mark"><Terminal size={18}/></span><span><strong>BINARY LANGUAGE</strong><small>CODE THE FUTURE_</small></span></div><p>Built for curious minds. Keep learning, keep building.</p><div className="footer-links"><button onClick={() => goTo('learn')}>Learning library</button><button onClick={() => goTo('translator')}>Translator</button><a href="https://www.instagram.com/sandycoder09/" target="_blank" rel="noreferrer"><Instagram size={15}/> @sandycoder09 <ExternalLink size={12}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BINARY LANGUAGE</span><span>DESIGNED IN GREEN / BUILT WITH CURIOSITY</span></div></footer>
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  )
}

function Feature({ icon: Icon, number, title, description, action, onClick }) {
  return <article className="feature-card"><div className="feature-card-top"><span className="feature-icon"><Icon size={22}/></span><span>{number} / MODULE</span></div><h3>{title}</h3><p>{description}</p><button onClick={onClick}>{action}<ChevronRight size={16}/></button></article>
}
function PageTitle({ eyebrow, title, description }) {
  return <div className="page-title"><div className="eyebrow"><span className="pulse-dot"/>{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
}

export default App;
