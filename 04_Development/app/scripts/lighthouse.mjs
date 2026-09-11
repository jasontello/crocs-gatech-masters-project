import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const url = "http://127.0.0.1:4173/crocs-gatech-masters-project/";
const preview = spawn("npm", ["run", "preview"], { stdio: "inherit" });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Preview server did not start in time.");
}

let chrome;
try {
  await waitForServer();
  chrome = await launch({ chromeFlags: ["--headless", "--no-sandbox"] });
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  if (!result) throw new Error("Lighthouse returned no result.");

  await mkdir("reports", { recursive: true });
  await writeFile("reports/lighthouse.json", result.report);

  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([id, category]) => [
      id,
      Math.round((category.score ?? 0) * 100),
    ]),
  );
  console.log(`Lighthouse scores: ${JSON.stringify(scores)}`);

  const minimums = { performance: 85, accessibility: 95 };
  for (const [category, minimum] of Object.entries(minimums)) {
    if ((scores[category] ?? 0) < minimum) {
      throw new Error(`${category} score ${scores[category]} is below ${minimum}.`);
    }
  }
} finally {
  await chrome?.kill();
  preview.kill("SIGTERM");
}
