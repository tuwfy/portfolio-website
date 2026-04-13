import React, { useEffect, useRef, useState } from 'react';

/** Set your live links here */
const FOURSEAT_URL = 'https://github.com/tuwfy/fourseat';
const QUANT_URL = 'https://github.com/tuwfy';

const CODE_LINES = [
  { key: 'l1', parts: [{ c: 'kw', t: 'import' }, { c: 'pl', t: ' numpy ' }, { c: 'kw', t: 'as' }, { c: 'var', t: ' np' }] },
  { key: 'l2', parts: [{ c: 'kw', t: 'from' }, { c: 'pl', t: ' scipy.optimize ' }, { c: 'kw', t: 'import' }, { c: 'fn', t: ' minimize' }] },
  { key: 'l3', parts: [] },
  {
    key: 'l4',
    parts: [
      { c: 'kw', t: 'def' },
      { c: 'fn', t: ' portfolio_sharpe' },
      { c: 'pl', t: '(' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'mu' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'Sigma' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'rf' },
      { c: 'pl', t: '=' },
      { c: 'num', t: '0.02' },
      { c: 'pl', t: '):' },
    ],
  },
  {
    key: 'l5',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'ret' },
      { c: 'pl', t: ' = float(' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: ' @ ' },
      { c: 'var', t: 'mu' },
      { c: 'pl', t: ')' },
    ],
  },
  {
    key: 'l6',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'vol' },
      { c: 'pl', t: ' = float(np.sqrt(' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: ' @ ' },
      { c: 'var', t: 'Sigma' },
      { c: 'pl', t: ' @ ' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: '))' },
    ],
  },
  {
    key: 'l7',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'kw', t: 'return' },
      { c: 'pl', t: ' -((' },
      { c: 'var', t: 'ret' },
      { c: 'pl', t: ' - ' },
      { c: 'var', t: 'rf' },
      { c: 'pl', t: ') / max(' },
      { c: 'var', t: 'vol' },
      { c: 'pl', t: ', ' },
      { c: 'num', t: '1e-9' },
      { c: 'pl', t: '))' },
    ],
  },
  { key: 'l8', parts: [] },
  {
    key: 'l9',
    parts: [
      { c: 'var', t: 'result' },
      { c: 'pl', t: ' = minimize(' },
      { c: 'fn', t: 'portfolio_sharpe' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'x0' },
      { c: 'pl', t: ', args=(' },
      { c: 'var', t: 'mu' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'Sigma' },
      { c: 'pl', t: '),' },
    ],
  },
  {
    key: 'l10',
    parts: [
      { c: 'pl', t: '                  method=' },
      { c: 'str', t: '"SLSQP"' },
      { c: 'pl', t: ', bounds=bounds, constraints=cons)' },
    ],
  },
];

const TERMINAL_LINES = [
  '$ python research/run_backtest.py --walk-forward',
  'Walk-forward: 36 windows | train 252d | test 21d',
  'Sharpe (OOS): 1.94   Max DD: -6.8%   Mean IC: 0.11',
  'Portfolio constraints satisfied. Optimizer: 312ms.',
];

function renderLinePartial(line, maxChars) {
  let left = maxChars;
  return line.parts.map((p, j) => {
    if (left <= 0) return null;
    const take = Math.min(p.t.length, left);
    left -= take;
    if (take <= 0) return null;
    return (
      <span key={j} className={`q-${p.c}`}>
        {p.t.slice(0, take)}
      </span>
    );
  });
}

function QuantCodeDemo() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const preRef = useRef(null);

  useEffect(() => {
    if (lineIdx >= CODE_LINES.length) return undefined;
    const line = CODE_LINES[lineIdx];
    const len = line.parts.reduce((n, p) => n + p.t.length, 0);
    const delay = charIdx < len ? 16 : lineIdx === CODE_LINES.length - 1 ? 600 : 90;
    const id = window.setTimeout(() => {
      if (charIdx < len) {
        setCharIdx((c) => c + 1);
      } else {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [lineIdx, charIdx]);

  useEffect(() => {
    let raf = 0;
    const el = preRef.current;
    const tick = (t) => {
      if (el && el.scrollHeight > el.clientHeight) {
        const m = (t * 0.00003) % 1;
        el.scrollTop = m * (el.scrollHeight - el.clientHeight);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const visible = [];
  for (let i = 0; i < lineIdx; i += 1) {
    visible.push({ line: CODE_LINES[i], full: true });
  }
  if (lineIdx < CODE_LINES.length) {
    visible.push({ line: CODE_LINES[lineIdx], full: false, max: charIdx });
  }

  return (
    <div className="quant-demo">
      <div className="quant-window">
        <div className="quant-window-titlebar">
          <span className="quant-dot quant-dot--r" />
          <span className="quant-dot quant-dot--y" />
          <span className="quant-dot quant-dot--g" />
          <span className="quant-window-title">quant_research / backtest.py</span>
        </div>
        <pre ref={preRef} className="quant-code">
          {visible.map(({ line, full, max }) => (
            <div key={line.key} className="quant-code-line">
              {full
                ? line.parts.map((p, j) => (
                    <span key={j} className={`q-${p.c}`}>{p.t}</span>
                  ))
                : renderLinePartial(line, max)}
            </div>
          ))}
          {lineIdx < CODE_LINES.length && <span className="quant-cursor">▍</span>}
        </pre>
      </div>
      <div className="quant-terminal">
        <div className="quant-terminal-head">Output</div>
        <div className={`quant-terminal-body${lineIdx >= CODE_LINES.length ? ' quant-terminal-body--live' : ''}`}>
          {lineIdx >= CODE_LINES.length
            && TERMINAL_LINES.map((t, i) => (
              <div
                key={i}
                className={i === 0 ? 'quant-term-cmd' : 'quant-term-line'}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {t}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const WorkApp = () => (
  <div className="mac-content-inner work-app-scroll work-projects">
    <header className="work-projects-intro">
      <h2>Projects</h2>
      <p>Product work and quantitative tooling—links open in a new tab.</p>
    </header>

    <article className="work-card work-card--fourseat">
      <div className="work-card-fourseat-visual" aria-hidden="true">
        <span className="work-fs-mark">4</span>
        <div className="work-fs-rings" />
      </div>
      <div className="work-card-body">
        <p className="work-card-kicker">Product</p>
        <h3>Fourseat</h3>
        <p className="work-card-desc">
          A seating and social experience built around groups of four—designed for clarity, flow, and real-world get-togethers.
          Explore the build, stack, and how the product handles discovery and coordination.
        </p>
        <a className="work-card-link" href={FOURSEAT_URL} target="_blank" rel="noopener noreferrer">
          Open Fourseat →
        </a>
      </div>
    </article>

    <article className="work-card work-card--quant">
      <div className="work-card-body work-card-body--quant">
        <p className="work-card-kicker">Quant research</p>
        <h3>Quant algo project</h3>
        <p className="work-card-desc">
          Walk-forward backtests, constrained portfolio optimization, and out-of-sample metrics—Sharpe, drawdown, and information
          coefficient—computed in a tight Python research loop.
        </p>
        <QuantCodeDemo />
        <a className="work-card-link work-card-link--on-dark" href={QUANT_URL} target="_blank" rel="noopener noreferrer">
          View repo / details →
        </a>
      </div>
    </article>
  </div>
);

export default WorkApp;
