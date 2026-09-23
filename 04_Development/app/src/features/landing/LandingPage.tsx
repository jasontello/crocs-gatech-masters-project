import "./landing.css";

const prototypeUrl = `${import.meta.env.BASE_URL}?prototype`;
const repositoryUrl = "https://github.com/jasontello/crocs-gatech-masters-project";

const prototypeFeatures = [
  "View refrigerator inventory",
  "Add items manually",
  "Use a simulated camera-assisted intake flow",
  "Review uncertain items",
  "Track date urgency",
  "Edit, use, discard, or remove items",
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <a className="landing-skip-link" href="#landing-main">Skip to content</a>

      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <span className="landing-wordmark">CROCS</span>
          <span className="landing-header-context">Georgia Tech research project</span>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero landing-container" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Refrigerator inventory research</p>
            <h1 id="landing-title">CROCS Refrigerator Inventory</h1>
            <p className="landing-lead">
              A camera-assisted refrigerator inventory research prototype exploring ways to make
              household food tracking easier and help reduce avoidable food waste.
            </p>
            <div className="landing-actions">
              <a className="landing-button landing-button-primary" href={prototypeUrl}>
                Launch Prototype
              </a>
              <a className="landing-button landing-button-secondary" href={repositoryUrl}>
                View GitHub
              </a>
            </div>
          </div>
          <img
            className="landing-hero-image"
            src={`${import.meta.env.BASE_URL}assets/editorial/imperfect-orange.webp`}
            alt=""
            aria-hidden="true"
          />
        </section>

        <div className="landing-content landing-container">
          <section className="landing-section landing-section-split" aria-labelledby="problem-heading">
            <h2 id="problem-heading">The Problem</h2>
            <p>
              Household food can be forgotten, expire, or be discarded because people may not have
              an easy way to keep track of what is already in their refrigerator.
            </p>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="goal-heading">
            <h2 id="goal-heading">Research Goal</h2>
            <p>
              This project explores whether a camera-assisted refrigerator inventory interface can
              reduce the effort required to record and manage food compared with manual inventory
              entry.
            </p>
          </section>

          <section className="landing-section landing-prototype" aria-labelledby="prototype-heading">
            <div>
              <h2 id="prototype-heading">Prototype</h2>
              <p>In the current prototype, users can:</p>
            </div>
            <div>
              <ul className="landing-feature-list">
                {prototypeFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <p className="landing-prototype-note">
                Product recognition and some camera behaviors are currently simulated for research
                prototyping. Live AI recognition is not implemented.
              </p>
              <a className="landing-text-link" href={prototypeUrl}>Launch Prototype</a>
            </div>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="stage-heading">
            <h2 id="stage-heading">Current Stage</h2>
            <p>
              This is an active Georgia Tech CROCS research prototype. It is still being developed
              and evaluated.
            </p>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="information-heading">
            <h2 id="information-heading">Project Information</h2>
            <div className="landing-project-information">
              <p><strong>Researcher:</strong> Jason Tello</p>
              <p>Georgia Institute of Technology</p>
              <p>CS 8903, Computing Research Opportunities for Conservation and Sustainability (CROCS)</p>
              <p><a className="landing-text-link" href={repositoryUrl}>View the GitHub repository</a></p>
            </div>
          </section>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">CROCS Refrigerator Inventory · Georgia Tech CS 8903</div>
      </footer>
    </div>
  );
}
