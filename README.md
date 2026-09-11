# Camera-Assisted Refrigerator Inventory System for Reducing Household Food Waste

## Overview

This project explores whether camera-assisted food logging can reduce the time and effort required to maintain a household refrigerator inventory compared with manual entry.

The system is being developed as a mobile-responsive web application. Users can photograph or upload a food item, receive an automated recognition suggestion, confirm, correct, or reject the suggestion, and then add the item to their refrigerator inventory.

## Research Question

To what extent can camera-assisted food logging reduce the time and effort required to maintain a refrigerator inventory compared with manual entry?

## Goals

- Reduce friction in food inventory tracking
- Compare camera-assisted entry with manual entry
- Measure task-completion time and perceived effort
- Explore how recognition confidence and correction affect usability
- Support better awareness of food expiration and household food waste

## Planned Features

- Camera or image upload
- Food-recognition suggestions
- Confirm, correct, or reject recognition results
- Manual-entry fallback
- Refrigerator inventory management
- Expiration-date tracking
- Mobile-responsive interface

## Setup-A status

This repository contains the functional, mobile-responsive web prototype used for Georgia Tech CS 8903 A03 Setup-A. The application is an installable PWA with an offline application shell. GitHub Actions runs type checking, linting, unit tests, browser accessibility checks, a production build, and Lighthouse before GitHub Pages deployment.

The recognition and camera experiences remain deterministic research simulations. Full inventory infrastructure, authentication, a backend, and production image recognition are intentionally outside the Setup-A scope.

## Live application

- Application: <https://jasontello.github.io/crocs-gatech-masters-project/>
- Source: <https://github.com/jasontello/crocs-gatech-masters-project>

## Local development

The application requires Node.js 24 and npm. From the repository root:

```bash
cd 04_Development/app
npm ci
npm run dev
```

Vite prints the local address. Because the production deployment uses a GitHub Pages project path, the local app is available at `/crocs-gatech-masters-project/`.

## Verification

Run the complete local verification suite after installing Playwright's Chromium browser:

```bash
cd 04_Development/app
npx playwright install chromium
npm run verify
```

The suite runs type checking, linting, 27 unit tests, the production build, mobile browser and automated accessibility checks, PWA registration checks, and Lighthouse. Lighthouse writes its JSON output to `04_Development/app/reports/lighthouse.json`.

## Deployment

Pushing to `main` starts `.github/workflows/deploy.yml`. The workflow repeats all checks, uploads `04_Development/app/dist`, and deploys it to GitHub Pages only if verification passes.

Pull requests use `.github/workflows/ci.yml`. Both workflows can also be run manually from the repository's Actions tab.

## Course

Georgia Tech  
CS 8903 CROCS  
Fall 2026
