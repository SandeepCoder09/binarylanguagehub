import { useState, useCallback, useMemo } from 'react';
import {
  Code2, Binary, ArrowLeftRight, Copy, Check,
  RotateCcw, ShieldCheck, Zap, CircleHelp, ChevronRight, Terminal,
} from 'lucide-react';

// ── Conversion helpers ──────────────────────────────────────────────────────
function toBinary(text) {
  return [...text]
    .map(char => {
      const cp = char.codePointAt(0);
      return cp.toString(2).padStart(8, '0');
    })
    .join(' ');
}

function fromBinary(raw) {
  const clean = raw.trim();
  if (!clean) return '';
  const groups = clean.split(/[\s,]+/).filter(Boolean);
  const invalid = groups.find(g => !/^[01]{1,21}$/.test(g));
  if (invalid) throw new Error(`"${invalid}" is not a valid binary group. Use only 0 and 1, separated by spaces.`);
  return groups
    .map(g => {
      const cp = parseInt(g, 2);
      if (cp < 0 || cp > 0x10ffff) throw new Error(`Code point ${cp} is outside the valid Unicode range.`);
      return String.fromCodePoint(cp);
    })
    .join('');
}

// ── Example inputs ──────────────────────────────────────────────────────────
const TEXT_EXAMPLES = ['Hello', 'Hi!', 'A', '42', 'BLH'];
const BINARY_EXAMPLES = [
  { label: '"Hi"', value: '01001000 01101001' },
  { label: '"A"', value: '01000001' },
  { label: '"0"', value: '00110000' },
];

export default function BinaryTranslator({ onToast }) {
  const [mode, setMode] = useState('toBinary');
  const [textInput, setTextInput] = useState('Hello, world!');
  const [binaryInput, setBinaryInput] = useState('01001000 01100101 01101100 01101100 01101111');
  const [result, setResult] = useState(() => toBinary('Hello, world!'));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedIn, setCopiedIn] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  // ── Conversion ─────────────────────────────────────────────────────
  function runConvert() {
    setError('');
    setIsDecoding(true);
    setTimeout(() => {
      try {
        const out = mode === 'toBinary'
          ? toBinary(textInput)
          : fromBinary(binaryInput);
        setResult(out || '(empty result)');
      } catch (err) {
        setError(err.message);
        setResult('');
      } finally {
        setIsDecoding(false);
      }
    }, 60);
  }

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setError('');
    // Instant smooth reciprocal flip if possible
    try {
      if (next === 'fromBinary' && result && result !== '(empty result)') {
        setBinaryInput(result);
        const decoded = fromBinary(result);
        setResult(decoded || '');
      } else if (next === 'toBinary' && result && result !== '(empty result)') {
        setTextInput(result);
        const encoded = toBinary(result);
        setResult(encoded || '');
      } else {
        setResult('');
      }
    } catch (_) {
      setResult('');
    }
  }

  function reset() {
    setTextInput('');
    setBinaryInput('');
    setResult('');
    setError('');
  }

  // ── Copy helpers ────────────────────────────────────────────────────
  async function copyText(text, setFlag) {
    if (!text || text === '(empty result)') return;
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      onToast('Copied to clipboard!', 'success');
      setTimeout(() => setFlag(false), 1800);
    } catch {
      onToast('Select and copy manually.', 'error');
    }
  }

  const copyResult = useCallback(() => copyText(result, setCopied), [result, onToast]);
  const copyInput = useCallback(() => {
    const val = mode === 'toBinary' ? textInput : binaryInput;
    copyText(val, setCopiedIn);
  }, [mode, textInput, binaryInput, onToast]);

  const inputVal = mode === 'toBinary' ? textInput : binaryInput;
  const setInput = mode === 'toBinary' ? setTextInput : setBinaryInput;

  // Split binary into inspectable chunks for animated bit chips
  const binaryChunks = useMemo(() => {
    if (mode === 'toBinary' && result && result !== '(empty result)' && !error) {
      return result.split(' ');
    }
    return null;
  }, [mode, result, error]);

  return (
    <main className="page-main section-wrap" id="translator-page">
      {/* Page header */}
      <div className="page-title">
        <div className="eyebrow-row">
          <span className="pulse-dot" />
          <span className="eyebrow-text">TOOL_001 / REAL-TIME LAB</span>
        </div>
        <h1>Binary <span className="accent-text">Translator.</span></h1>
        <p className="page-desc">
          Convert readable text into binary, or decode binary back into text.
          Everything runs locally in your browser sandbox — zero telemetry.
        </p>
      </div>

      {/* Tool panel */}
      <div className="tool-panel cyber-card">
        {/* Panel header */}
        <div className="tool-panel-head">
          <div className="window-dots" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span className="tool-panel-title">
            <Terminal size={13} aria-hidden="true" />
            matrix_transcoder.bin
          </span>
          <span className="live-badge">
            <span className="status-dot" aria-hidden="true" />
            {isDecoding ? 'PROCESSING...' : 'READY'}
          </span>
        </div>

        {/* Mode switcher with smooth indicator */}
        <div className="mode-switch-wrapper">
          <div className="mode-switch" role="group" aria-label="Conversion mode">
            <button
              className={`mode-btn ${mode === 'toBinary' ? 'active' : ''}`}
              onClick={() => switchMode('toBinary')}
              aria-pressed={mode === 'toBinary'}
            >
              <Code2 size={15} aria-hidden="true" />
              <span>Text → Binary</span>
            </button>
            <button
              className={`mode-btn ${mode === 'fromBinary' ? 'active' : ''}`}
              onClick={() => switchMode('fromBinary')}
              aria-pressed={mode === 'fromBinary'}
            >
              <Binary size={15} aria-hidden="true" />
              <span>Binary → Text</span>
            </button>
          </div>
        </div>

        {/* Encoding note */}
        <p className="encoding-note">
          <ShieldCheck size={13} aria-hidden="true" />
          {mode === 'toBinary'
            ? 'Standard ASCII (0–127) & UTF-8 code point conversion into 8-bit binary groups.'
            : 'Byte streams decoded into Unicode characters with validation.'}
        </p>

        {/* Grid */}
        <div className="translator-grid">
          {/* Input side */}
          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="source-input">
                {mode === 'toBinary' ? 'INPUT TEXT' : 'BINARY INPUT (0s & 1s)'}
              </label>
              <button
                className="icon-btn btn-click-fx"
                onClick={copyInput}
                title="Copy input"
                aria-label="Copy input"
              >
                {copiedIn ? <Check size={14} className="accent-text" /> : <Copy size={14} />}
              </button>
            </div>
            <textarea
              id="source-input"
              value={inputVal}
              onChange={e => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder={mode === 'toBinary' ? 'Type a message to encode...' : '01001000 01101001'}
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
              rows={5}
              className="hacker-input"
            />
            <div className="field-hint">
              {mode === 'toBinary'
                ? `${textInput.length} character${textInput.length !== 1 ? 's' : ''}`
                : 'Separate binary bytes with spaces or commas'}
            </div>

            {/* Example inputs */}
            <div className="examples-row">
              <span className="examples-label">Presets:</span>
              {mode === 'toBinary'
                ? TEXT_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      className="example-chip btn-click-fx"
                      onClick={() => {
                        setTextInput(ex);
                        setError('');
                      }}
                    >
                      {ex}
                    </button>
                  ))
                : BINARY_EXAMPLES.map(ex => (
                    <button
                      key={ex.label}
                      className="example-chip btn-click-fx"
                      onClick={() => {
                        setBinaryInput(ex.value);
                        setError('');
                      }}
                    >
                      {ex.label}
                    </button>
                  ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="translate-arrow" aria-hidden="true">
            <button
              className="arrow-circle-btn"
              onClick={() => switchMode(mode === 'toBinary' ? 'fromBinary' : 'toBinary')}
              title="Toggle conversion direction"
              aria-label="Toggle conversion direction"
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* Output side */}
          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="result-output">CONVERTED OUTPUT</label>
              <button
                className="icon-btn btn-click-fx"
                onClick={copyResult}
                title="Copy result"
                aria-label="Copy result"
              >
                {copied ? <Check size={14} className="accent-text" /> : <Copy size={14} />}
              </button>
            </div>

            <div
              id="result-output"
              className={`result-box hacker-output ${error ? 'result-error' : ''} ${isDecoding ? 'is-decoding' : ''}`}
              role="region"
              aria-label="Conversion output"
              aria-live="polite"
            >
              {error ? null : binaryChunks ? (
                <div className="bit-chips-container">
                  {binaryChunks.map((chunk, idx) => {
                    let asciiChar = '';
                    try {
                      const cp = parseInt(chunk, 2);
                      asciiChar = cp >= 32 && cp <= 126 ? String.fromCharCode(cp) : '·';
                    } catch (_) {}
                    return (
                      <span key={idx} className="bit-chip" title={`Byte ${idx + 1}: char '${asciiChar}'`}>
                        {chunk}
                      </span>
                    );
                  })}
                </div>
              ) : result ? (
                <span className="decoded-text">{result}</span>
              ) : (
                <span className="muted-text">Awaiting input stream…</span>
              )}
            </div>

            <div className="field-hint">
              {result && result !== '(empty result)'
                ? `${result.length} characters generated`
                : 'Ready for conversion'}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="error-banner" role="alert">
            <CircleHelp size={15} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="tool-actions">
          <button className="btn-primary btn-hacker-glow btn-click-fx" onClick={runConvert} id="btn-convert">
            <Zap size={16} aria-hidden="true" />
            <span>Convert Now</span>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
          <button className="btn-secondary btn-hacker-glow btn-click-fx" onClick={copyResult} id="btn-copy">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied to Buffer!' : 'Copy Result'}</span>
          </button>
          <button
            className="icon-btn-lg btn-click-fx"
            title="Reset fields"
            aria-label="Reset translator"
            onClick={reset}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <p className="tool-note">
          <ShieldCheck size={14} aria-hidden="true" />
          Local browser execution only — fully offline capable.
        </p>
      </div>

      {/* Info strip */}
      <div className="info-strip cyber-card">
        <Binary size={22} aria-hidden="true" className="info-strip-icon" />
        <div>
          <strong>Under the hood</strong>
          <p>
            Text → Binary maps each character code point into standard binary bitstrings (base-2).
            Binary → Text parses space-separated byte octets back into valid UTF-8/Unicode characters in real time.
          </p>
        </div>
      </div>
    </main>
  );
}
