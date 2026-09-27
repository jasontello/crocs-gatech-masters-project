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

const prototypeScreens = [
  {
    file: "home",
    title: "Home overview",
    alt: "Prototype home screen with three tracked groceries and two items to use soon.",
    caption: "A summary of the demo inventory highlights food to use first and provides an entry point for scanning groceries.",
  },
  {
    file: "inventory",
    title: "Refrigerator inventory",
    alt: "My Fridge screen with search and sample milk, chicken, and yogurt grouped by date urgency.",
    caption: "Users can search their inventory and open individual items to review or update their details.",
  },
  {
    file: "recognition-review",
    title: "Review a suggested item",
    alt: "Simulated camera recognition screen suggesting Whole Milk with options to confirm or edit it.",
    caption: "The simulated recognition flow asks users to confirm or correct a suggested item before adding it to a batch.",
  },
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
            width={640}
            height={640}
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
            <div className="landing-copy">
              <p>
                This project explores whether a camera-assisted refrigerator inventory interface can
                reduce the effort required to record and manage food compared with manual inventory entry.
              </p>
              <h3>Research Question</h3>
              <p>
                To what extent can camera-assisted food logging reduce the time and effort required
                to maintain a refrigerator inventory compared with manual entry?
              </p>
              <p>
                Planned evaluation will compare task-completion time, recognition corrections, and
                perceived effort across the two entry methods. Reduced food waste is a longer-term
                motivation; it has not been demonstrated by this prototype.
              </p>
            </div>
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

          <section id="prototype-screens" className="landing-section" aria-labelledby="screens-heading">
            <h2 id="screens-heading">Prototype Screens</h2>
            <p className="landing-status-date">
              Captured <time dateTime="2026-09-26">September 26, 2026</time> · Sample groceries and simulated recognition.
              Select an image to view the full screenshot.
            </p>
            <div className="landing-screen-gallery">
              {prototypeScreens.map((screen) => (
                <figure className="landing-screen" key={screen.file}>
                  <a
                    href={`${import.meta.env.BASE_URL}assets/prototype/${screen.file}.webp`}
                    aria-label={`View full screenshot: ${screen.title}`}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}assets/prototype/${screen.file}.webp`}
                      width={780}
                      height={1688}
                      loading="lazy"
                      decoding="async"
                      alt={screen.alt}
                    />
                  </a>
                  <figcaption>
                    <h3>{screen.title}</h3>
                    <p>{screen.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="landing-section landing-workflow" aria-labelledby="workflow-heading">
            <h2 id="workflow-heading">How the System Works</h2>
            <p className="landing-workflow-intro">
              The mobile-first concept follows the sequence below. The current prototype lets users
              explore the intake and review interactions with simulated recognition results.
            </p>
            <ol className="landing-workflow-list">
              <li>
                <h3>Scan on phone</h3>
                <p>
                  Start camera-assisted intake or select a food photo. The prototype simulates
                  scanning and supports local photo selection and preview, with manual entry as a fallback.
                </p>
              </li>
              <li>
                <h3>Review recognition results</h3>
                <p>
                  Confirm or correct the suggested item and review uncertain matches before adding
                  a batch. Current suggestions come from scripted demo scenarios.
                </p>
              </li>
              <li>
                <h3>Maintain refrigerator inventory</h3>
                <p>
                  View items and date urgency, edit details, and mark food used or discarded.
                  Inventory is saved in this browser on this device.
                </p>
              </li>
              <li>
                <h3>Access across devices (future)</h3>
                <p>
                  A future shared inventory could connect phone intake with desktop and web access
                  through a synchronized backend. Cross-device synchronization is not implemented.
                </p>
              </li>
            </ol>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="stage-heading">
            <div>
              <h2 id="stage-heading">Current Stage</h2>
              <p className="landing-status-date">
                Documented <time dateTime="2026-09-26">September 26, 2026</time>
              </p>
            </div>
            <div className="landing-copy">
              <p>
                This Georgia Tech CROCS project is an interaction prototype for exploring the food
                logging workflow. Inventory management, local photo preview, and browser storage
                work; recognition is simulated so the review and recovery paths can be explored.
              </p>
              <p>
                Next research steps are to define the comparison tasks and measures, then evaluate
                camera-assisted entry against manual entry. No completed participant studies or
                measured reductions in logging effort or food waste are reported here.
              </p>
            </div>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="limitations-heading">
            <div>
              <h2 id="limitations-heading">Current Limitations</h2>
              <p className="landing-status-date">
                Documented <time dateTime="2026-09-26">September 26, 2026</time>
              </p>
            </div>
            <ul className="landing-detail-list">
              <li>
                Camera permission, the scanner preview, barcode lookup, food recognition, and
                printed-date reading use deterministic simulations. There is no live AI recognition service.
              </li>
              <li>
                Inventory uses browser local storage. There are no accounts, shared households,
                cloud backups, or real-time cross-device updates. Clearing browser data removes saved inventory.
              </li>
              <li>
                Estimated use-first dates are illustrative guidance, not verified package-specific
                expiration dates or a guarantee of food safety.
              </li>
              <li>
                Marking food used or discarded removes it from the active inventory; a persistent
                outcome history and study measurements are not implemented.
              </li>
            </ul>
          </section>

          <section className="landing-section landing-section-split" aria-labelledby="vision-heading">
            <h2 id="vision-heading">System Vision</h2>
            <div className="landing-copy">
              <p>
                The intended direction is phone-based capture, user-reviewed recognition, and a
                shared refrigerator inventory that can also be accessed from desktop or web.
                Mobile and desktop clients would use the same backend rather than separate device inventories.
              </p>
              <p>
                Future development would require real camera and recognition integration, a backend
                with household access controls and synchronization, and a way to measure logging
                effort and inventory outcomes. These are planned capabilities, not features of the current prototype.
              </p>
            </div>
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
