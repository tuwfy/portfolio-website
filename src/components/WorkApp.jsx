import React, { useEffect, useState } from 'react';

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

function MpwTitlebar({ title }) {
  return (
    <div className="work-mpw-titlebar">
      <span className="work-mpw-close" aria-hidden="true" />
      <span className="work-mpw-title">{title}</span>
      <span className="work-mpw-zoom" aria-hidden="true" />
    </div>
  );
}

const FOURSEAT_ROLES = ['Strategist', 'CFO', 'CTO', 'Contrarian'];

function QuantCodeDemo() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

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
        <MpwTitlebar title="Macintosh HD:MPW:Projects:backtest.py" />
        <pre className="quant-code">
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
        <MpwTitlebar title="MPW Shell — Output" />
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

    <div className="work-projects-grid">
      <article className="work-card work-card--fourseat">
        <div className="work-mpw-shell work-mpw-shell--tall">
          <MpwTitlebar title="Macintosh HD:Projects:FourSeat" />
          <div className="work-mpw-body">
            <p className="work-card-kicker">Product</p>
            <h3>FourSeat</h3>
            <p className="work-card-desc">
              FourSeat is an AI-powered decision-making platform that gives founders and operators a personal board of directors.
              Instead of one flat model reply or pure instinct, every decision runs through four independent AI members—then they debate,
              and a Chairman synthesizes the thread into a single verdict with risks, opportunities, and concrete next steps.
            </p>
            <div className="work-fourseat-roles" aria-label="Board members">
              {FOURSEAT_ROLES.map((role, i) => (
                <span
                  key={role}
                  className="work-role-chip"
                  style={{ animationDelay: `${0.12 + i * 0.1}s` }}
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="work-card-desc work-card-desc--compact">
              Each seat challenges the others before the Chairman locks the plan—so you get structured disagreement, not groupthink.
            </p>
            <a className="work-card-link work-card-link--mac" href={FOURSEAT_URL} target="_blank" rel="noopener noreferrer">
              Open FourSeat →
            </a>
          </div>
        </div>
      </article>

      <article className="work-card work-card--quant">
        <div className="work-mpw-shell work-mpw-shell--tall">
          <MpwTitlebar title="Macintosh HD:Projects:QuantResearch" />
          <div className="work-mpw-body work-mpw-body--quant-intro">
            <p className="work-card-kicker">Quant research</p>
            <h3>Quant algo project</h3>
            <p className="work-card-desc">
              Walk-forward backtests, constrained portfolio optimization, and out-of-sample metrics—Sharpe, drawdown, and information
              coefficient—in a tight Python research loop.
            </p>
            <div className="work-quant-demo-wrap">
              <QuantCodeDemo />
            </div>
            <a className="work-card-link work-card-link--mac" href={QUANT_URL} target="_blank" rel="noopener noreferrer">
              View repo / details →
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
);

export default WorkApp;
