import React, { useEffect, useState } from 'react';

/** Set your live links here */
const FOURSEAT_URL = 'https://fourseat.vercel.app/';
const QUANT_GITHUB_PROFILE_URL = 'https://github.com/tuwfy';

const CODE_LINES = [
  { key: 'l1', parts: [{ c: 'kw', t: 'import' }, { c: 'pl', t: ' numpy ' }, { c: 'kw', t: 'as' }, { c: 'var', t: ' np' }] },
  { key: 'l2', parts: [{ c: 'kw', t: 'from' }, { c: 'pl', t: ' dataclasses ' }, { c: 'kw', t: ' import' }, { c: 'fn', t: ' dataclass' }] },
  { key: 'l3', parts: [{ c: 'kw', t: 'from' }, { c: 'pl', t: ' scipy.optimize ' }, { c: 'kw', t: 'import' }, { c: 'fn', t: ' minimize' }] },
  { key: 'l4', parts: [] },
  { key: 'l5', parts: [{ c: 'mod', t: '@dataclass' }] },
  {
    key: 'l6',
    parts: [
      { c: 'kw', t: 'class' },
      { c: 'fn', t: ' WalkForwardConfig' },
      { c: 'pl', t: ':' },
    ],
  },
  {
    key: 'l7',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'train_days' },
      { c: 'pl', t: ': int = ' },
      { c: 'num', t: '252' },
      { c: 'pl', t: '; ' },
      { c: 'var', t: 'test_days' },
      { c: 'pl', t: ': int = ' },
      { c: 'num', t: '21' },
    ],
  },
  {
    key: 'l8',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'embargo' },
      { c: 'pl', t: ': int = ' },
      { c: 'num', t: '5' },
      { c: 'pl', t: '  # purged CV gap' },
    ],
  },
  { key: 'l9', parts: [] },
  {
    key: 'l10',
    parts: [
      { c: 'kw', t: 'def' },
      { c: 'fn', t: ' factor_ic' },
      { c: 'pl', t: '(' },
      { c: 'var', t: 'f' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'fwd_ret' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: '):' },
    ],
  },
  {
    key: 'l11',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'rank_f' },
      { c: 'pl', t: ' = f.rank(pct=' },
      { c: 'kw', t: 'True' },
      { c: 'pl', t: '); ' },
      { c: 'var', t: 'rank_r' },
      { c: 'pl', t: ' = fwd_ret.rank(pct=' },
      { c: 'kw', t: 'True' },
      { c: 'pl', t: ')' },
    ],
  },
  {
    key: 'l12',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'kw', t: 'return' },
      { c: 'pl', t: ' float((' },
      { c: 'var', t: 'rank_f' },
      { c: 'pl', t: ' * ' },
      { c: 'var', t: 'rank_r' },
      { c: 'pl', t: ' * ' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: ').sum() / ' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: '.sum())' },
    ],
  },
  { key: 'l13', parts: [] },
  {
    key: 'l14',
    parts: [
      { c: 'kw', t: 'def' },
      { c: 'fn', t: ' cvar_objective' },
      { c: 'pl', t: '(' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'losses' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'alpha' },
      { c: 'pl', t: '=' },
      { c: 'num', t: '0.95' },
      { c: 'pl', t: '):' },
    ],
  },
  {
    key: 'l15',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'var', t: 'port' },
      { c: 'pl', t: ' = losses @ ' },
      { c: 'var', t: 'w' },
      { c: 'pl', t: '; ' },
      { c: 'var', t: 'q' },
      { c: 'pl', t: ' = np.quantile(' },
      { c: 'var', t: 'port' },
      { c: 'pl', t: ', ' },
      { c: 'num', t: '1' },
      { c: 'pl', t: ' - ' },
      { c: 'var', t: 'alpha' },
      { c: 'pl', t: ')' },
    ],
  },
  {
    key: 'l16',
    parts: [
      { c: 'pl', t: '    ' },
      { c: 'kw', t: 'return' },
      { c: 'pl', t: ' float(np.mean(np.maximum(' },
      { c: 'num', t: '0' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'q' },
      { c: 'pl', t: ' - ' },
      { c: 'var', t: 'port' },
      { c: 'pl', t: ')))' },
    ],
  },
  { key: 'l17', parts: [] },
  {
    key: 'l18',
    parts: [
      { c: 'var', t: 'w_star' },
      { c: 'pl', t: ' = minimize(' },
      { c: 'fn', t: 'cvar_objective' },
      { c: 'pl', t: ', ' },
      { c: 'var', t: 'x0' },
      { c: 'pl', t: ', args=(' },
      { c: 'var', t: 'L_hist' },
      { c: 'pl', t: '),' },
    ],
  },
  {
    key: 'l19',
    parts: [
      { c: 'pl', t: '                 method=' },
      { c: 'str', t: '"SLSQP"' },
      { c: 'pl', t: ', bounds=bnds, constraints=[turn, lev])' },
    ],
  },
];

const TERMINAL_LINES = [
  '$ python engine/run_walk_forward.py --regime-neutral --cost-bps 12',
  'Loaded 4.18M bars | universe: liquid_large_cap | factors: 38',
  'Walk-forward: 48 windows | train 252d | test 21d | embargo 5d',
  'Median OOS Sharpe: 2.31  | Calmar: 1.82  | Max DD: -5.1%',
  'Mean rank IC: 0.14 (t=3.8)  | turnover ann. 0.41×',
  'Post-cost net alpha (blend): +418 bps  | ADMM risk overlay: 41ms',
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

function FourSeatMiniPreview() {
  return (
    <a
      href={FOURSEAT_URL}
      className="work-fourseat-mini-block"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="work-fourseat-mini-browser">
        <div className="work-fourseat-mini-chrome" aria-hidden="true">
          <span className="work-fourseat-mini-close" />
          <span className="work-fourseat-mini-url">fourseat.vercel.app</span>
          <span className="work-fourseat-mini-zoom" />
        </div>
        <div className="work-fourseat-mini-viewport">
          {/*
            Live site uses X-Frame-Options: DENY — embed a compact animated mock
            of the marketing page; click still opens the real app.
          */}
          <div className="work-fourseat-faux" aria-hidden="true">
            <div className="work-fourseat-faux-nav">
              <span className="work-fourseat-faux-logo">Fourseat AI</span>
              <span className="work-fourseat-faux-nav-links">How it works · Pricing · About</span>
            </div>
            <div className="work-fourseat-faux-hero">
              <span className="work-fourseat-faux-kicker">Early access is now open</span>
              <p className="work-fourseat-faux-head">
                Fourseat,
                <br />
                your personal <em>board of directors</em>
              </p>
              <p className="work-fourseat-faux-sub">Full-time AI that debates every decision.</p>
              <div className="work-fourseat-faux-row">
                <span className="work-fourseat-faux-btn">Get early access</span>
                <span className="work-fourseat-faux-btn work-fourseat-faux-btn--ghost">See pricing</span>
              </div>
            </div>
            <div className="work-fourseat-faux-board">
              <span>Strategist</span>
              <span>CFO</span>
              <span>CTO</span>
              <span>Contrarian</span>
              <span className="work-fourseat-faux-board-chair">Chair</span>
            </div>
          </div>
          <div className="work-fourseat-mini-shine" aria-hidden="true" />
          <div className="work-fourseat-mini-scan" aria-hidden="true" />
        </div>
      </div>
      <span className="work-fourseat-mini-caption">
        Mini landing (animated) — opens <strong>fourseat.vercel.app</strong> in a new tab
      </span>
    </a>
  );
}

function QuantCodeDemo() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= CODE_LINES.length) return undefined;
    const line = CODE_LINES[lineIdx];
    const len = line.parts.reduce((n, p) => n + p.t.length, 0);
    const delay = charIdx < len ? 10 : lineIdx === CODE_LINES.length - 1 ? 950 : 78;
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
        <MpwTitlebar title="Macintosh HD:MPW:Projects:walk_forward_stack.py" />
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
            <FourSeatMiniPreview />
            <a className="work-card-link work-card-link--mac" href={FOURSEAT_URL} target="_blank" rel="noopener noreferrer">
              Open FourSeat site →
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
              Private research codebase I iterate on solo—multi-window walk-forward validation, rank IC and factor hygiene, CVaR-style
              objectives with turnover and leverage constraints, post-cost simulation, and regime-aware blends. Nothing here is a public
              product; the link below is just my GitHub profile.
            </p>
            <div className="work-quant-demo-wrap">
              <QuantCodeDemo />
            </div>
            <a
              className="work-card-link work-card-link--mac"
              href={QUANT_GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              My GitHub profile →
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
);

export default WorkApp;
