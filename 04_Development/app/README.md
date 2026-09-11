# CROCS Refrigerator Inventory — Unified camera prototype

Mobile-first React and TypeScript prototype for the Georgia Tech CROCS research project. This iteration tests a low-friction camera workflow that recognizes packaged and unpackaged groceries in one continuous session.

## Feature specifications

- [AI-assisted food intake and recommended use-by dates](docs/ai-assisted-food-intake-spec.md) — product and technical concept for combining barcode, visual-food, and printed-date recognition behind one camera experience.
- [Camera intake journey map](docs/photo-intake-journey-map.md) — implemented happy paths, recovery states, design hypotheses, and deferred UX questions.

## Run locally

```bash
npm ci
npm run dev
```

Open the local address printed by Vite at `/crocs-gatech-masters-project/`. Use `npm run dev -- --host 0.0.0.0` to test from a phone on the same Wi-Fi network.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run lighthouse
```

`npm run verify` runs the complete sequence. The browser checks cover mobile layout, serious and critical accessibility violations, landscape usability, the web app manifest, and service-worker registration. Lighthouse enforces minimum scores of 80 for performance and 95 for accessibility while recording the exact result for review.

## PWA and deployment

The production build includes a web app manifest, install icons, an automatically registered service worker, and a precached offline application shell. Web delivery copies of the original editorial PNGs are generated during build without changing the source artwork.

GitHub Actions deploys a verified production build from `main` to <https://jasontello.github.io/crocs-gatech-masters-project/>. See the repository root README and `.github/workflows/deploy.yml` for the complete CI/CD path.

## Implemented prototype behavior

- Play a short monochrome opening animation that can be skipped by tapping anywhere
- Prioritize the home and fridge views by what should be used first
- Start a continuous simulated camera session from a live-preview-style entry point
- Present Camera and Manual as the only two user-facing intake methods
- Explain camera access on first use, with denied-access recovery and a manual fallback
- Recover when the camera finds nothing, sees multiple products, has low confidence, finds conflicting results, or cannot read a printed date
- Detect a demo product automatically, whether the match comes from a barcode or a visual food cue
- Show a fullscreen camera state and ask “Is this it?” before adding the match
- Support the phone experience in portrait and landscape orientations
- Test a deterministic leftover-tuna flow with two context questions and a cited recommended use-by date
- Test a packaged-salsa flow that confirms a printed date without unnecessary questions
- Review a selected photo before simulated analysis
- Recover from an unclear photo, an interrupted analysis, or unavailable camera access
- Correct a food suggestion and carry the corrected name into manual details
- Identify one demo product at a time and return to the camera between products
- Show a compact confirmation sheet with product, quantity, and estimated use-first date
- Simulate reading a printed package date through the same camera path
- Build a batch queue and review only likely matches or items needing confirmation
- Retain manual entry as a fallback within the batch flow
- Add the reviewed batch to the fridge and show a brief success state
- Mark inventory items as used or discarded, edit them, and undo removal
- Persist inventory data in `localStorage`

## Prototype limitations

- Camera capture, barcode lookup, visual-food recognition, follow-up logic, and printed-date scanning are simulated with deterministic demo fixtures.
- Camera permission is also simulated; the browser's real permission prompt is not connected yet.
- Camera uncertainty outcomes are deterministic research scenarios rather than live recognition failures.
- Estimated use-first dates are illustrative and are not package-specific expiration dates.
- The photo prototype does not call an AI service; its food suggestions and storage-guidance match are mocked for interaction testing.
- There is no backend, account system, cloud synchronization, analytics, or notification service.
- The interface is intentionally monochrome while the interaction flow is evaluated.
