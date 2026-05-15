import React from 'react';

const PROFILE_URL = 'https://www.linkedin.com/in/tylerriccardi/';

const LinkedInApp = () => (
  <div className="mac-content-inner linkedin-macos">
    <p className="linkedin-macos-disclaimer">
      Fan layout inspired by early LinkedIn. Not affiliated with LinkedIn. Opens your real profile in a new tab.
    </p>

    <div className="linkedin-macos-site">
      <header className="linkedin-macos-header">
        <div className="linkedin-macos-brand">
          <div className="linkedin-macos-logo-in" aria-hidden="true">
            in
          </div>
          <p className="linkedin-macos-tagline-era">Your network is bigger than you think.</p>
        </div>
        <div className="linkedin-macos-welcome">
          Welcome, <strong>Tyler</strong>
          <span className="linkedin-macos-welcome-sep"> | </span>
          <span className="linkedin-macos-fake-link">Sign Out</span>
        </div>
      </header>

      <nav className="linkedin-macos-tabstrip" aria-label="Decorative navigation (not functional)">
        {['Home', 'Search', 'Profile', 'Address Book', 'Network', 'Requests'].map((label) => (
          <span
            key={label}
            className={`linkedin-macos-tab${label === 'Profile' ? ' linkedin-macos-tab--active' : ''}`}
          >
            {label}
          </span>
        ))}
      </nav>
      <div className="linkedin-macos-subnav">
        <span className="linkedin-macos-subnav-link linkedin-macos-subnav-link--active">Profile</span>
        <span className="linkedin-macos-subnav-sep"> </span>
        <span className="linkedin-macos-fake-link">Account</span>
      </div>

      <div className="linkedin-macos-columns">
        <aside className="linkedin-macos-sidebar">
          <fieldset className="linkedin-macos-widget">
            <legend>Search your Network</legend>
            <div className="linkedin-macos-search-head">
              <span className="linkedin-macos-search-hint">Look up anyone (decorative)</span>
            </div>
            <select className="linkedin-macos-select" aria-label="Search scope" defaultValue="all">
              <option value="all">All users</option>
            </select>
            <input
              className="linkedin-macos-input"
              type="text"
              readOnly
              placeholder="Name, school, company…"
              aria-label="Search (decorative)"
            />
            <a
              className="linkedin-macos-btn-era linkedin-macos-btn-era--go"
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Go
            </a>
          </fieldset>

          <fieldset className="linkedin-macos-widget">
            <legend>Invitations</legend>
            <div className="linkedin-macos-invite-row">
              <span className="linkedin-macos-widget-icon" aria-hidden="true">
                {'\u2709'}
              </span>
              <p className="linkedin-macos-widget-text">
                Classmates and collaborators might be one click away. This preview jumps straight to my profile.
              </p>
              <a
                className="linkedin-macos-badge"
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile
              </a>
            </div>
          </fieldset>

          <fieldset className="linkedin-macos-widget">
            <legend>Connections</legend>
            <p className="linkedin-macos-widget-text">
              If you wandered in from the desktop, say hi on LinkedIn. I post about finance school, side projects, and
              weird web ideas.
            </p>
          </fieldset>
        </aside>

        <main className="linkedin-macos-main">
          <section className="linkedin-macos-panel">
            <h2 className="linkedin-macos-panel-title">Which of your real-world contacts are already LinkedIn?</h2>
            <p className="linkedin-macos-panel-lead">
              Same era, same question. Here the answer is easy: I am already on LinkedIn as Tyler Riccardi.
            </p>
            <a
              className="linkedin-macos-btn-era linkedin-macos-btn-era--primary"
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Find Contacts
            </a>
          </section>

          <a className="linkedin-macos-profile-hit" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <section className="linkedin-macos-panel linkedin-macos-panel--profile">
              <h2 className="linkedin-macos-panel-title">Finance, creativity, and the web</h2>
              <div className="linkedin-macos-profile-row">
                <div className="linkedin-macos-avatar-sm" aria-hidden="true">
                  TR
                </div>
                <div>
                  <div className="linkedin-macos-profile-name">Tyler Riccardi</div>
                  <div className="linkedin-macos-profile-headline">
                    Finance at UCF, side projects, and this retro desktop portfolio.
                  </div>
                  <ul className="linkedin-macos-bullets">
                    <li>Undergrad finance work at the University of Central Florida</li>
                    <li>Building small creative experiments on the open web</li>
                    <li>Trying to normalize niche: doing passions because I want to</li>
                    <li>Click this whole card to open my live LinkedIn profile</li>
                  </ul>
                </div>
              </div>
            </section>
          </a>

          <section className="linkedin-macos-panel">
            <h2 className="linkedin-macos-panel-title">Powering the next conversation</h2>
            <p className="linkedin-macos-panel-lead">
              Open the real site for messaging, experience history, and everything else this toy window cannot do.
            </p>
            <a className="linkedin-macos-btn-era" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
              Open linkedin.com
            </a>
            <p className="linkedin-macos-url-line">
              <span className="linkedin-macos-url-mono">{PROFILE_URL}</span>
            </p>
          </section>
        </main>
      </div>
    </div>
  </div>
);

export default LinkedInApp;
