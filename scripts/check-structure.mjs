import { access, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pagesUrl = "https://montesgp.github.io/digital-catalog/";
const previewUrl = `${pagesUrl}imgs/bergbach-fragrance-preliminar.jpg`;
const requiredFiles = [
  "index.html",
  "README.md",
  "LICENSE",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "config/config.js",
  "services/ProductService.js",
  "services/DecantService.js",
  "docs/ARCHITECTURE.md",
  "docs/digital-catalog-architecture-diagram.drawio",
  "docs/digital-catalog-qr.svg",
  ".github/workflows/ci.yml",
  ".github/workflows/pr-validation.yml",
  ".github/workflows/deploy-pages.yml",
];

const failures = [];

async function text(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function requireMatch(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

for (const relativePath of requiredFiles) {
  try {
    await access(resolve(root, relativePath));
  } catch {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

const [config, readme, architecture, diagram, qr, ci, prValidation, deploy] =
  await Promise.all([
    text("config/config.js"),
    text("README.md"),
    text("docs/ARCHITECTURE.md"),
    text("docs/digital-catalog-architecture-diagram.drawio"),
    text("docs/digital-catalog-qr.svg"),
    text(".github/workflows/ci.yml"),
    text(".github/workflows/pr-validation.yml"),
    text(".github/workflows/deploy-pages.yml"),
  ]);

requireMatch(config, new RegExp(`url:\\s*["']${pagesUrl.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`), "config/config.js must use the personal GitHub Pages URL.");
requireMatch(config, new RegExp(`previewImage:\\s*["']${previewUrl.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`), "config/config.js must use the personal Pages preview URL.");
requireMatch(config, /script\.google\.com\/macros\/s\//, "The configured Google Apps Script endpoint must remain configured.");
requireMatch(config, /perfumes:\s*["']CatalogParfum["']/, "The perfume Sheet name must remain CatalogParfum.");
requireMatch(config, /decants:\s*["']CatalogDecant["']/, "The decant Sheet name must remain CatalogDecant.");
if (config.includes("bergbach-fragrance.github.io/catalog")) {
  failures.push("config/config.js still points to the former GitHub Pages site.");
}

for (const [needle, message] of [
  [pagesUrl, "README.md must link to the personal GitHub Pages site."],
  ["docs/digital-catalog-qr.svg", "README.md must reference the versioned QR asset."],
  ["CatalogParfum", "README.md must document the operational data boundary."],
  ["CatalogDecant", "README.md must document the operational data boundary."],
  ["CI and local quality gates **never call", "README.md must state that gates do not call operational data."],
  ["CONTRIBUTING.md", "README.md must link contribution guidance."],
  ["LICENSE", "README.md must link the license."],
]) {
  if (!readme.includes(needle)) failures.push(message);
}

for (const [needle, message] of [
  ["ProductService", "Architecture must include ProductService."],
  ["DecantService", "Architecture must include DecantService."],
  ["CatalogParfum", "Architecture must include the perfume Sheet name."],
  ["CatalogDecant", "Architecture must include the decant Sheet name."],
  ["window.cachedProducts", "Architecture must document product caching."],
  ["window.cachedDecants", "Architecture must document decant caching."],
  ["Local assets", "Architecture must document local assets."],
]) {
  if (!architecture.includes(needle)) failures.push(message);
}

requireMatch(diagram, /digital-catalog/, "The draw.io diagram must identify digital-catalog.");
requireMatch(diagram, /CatalogParfum/, "The draw.io diagram must identify CatalogParfum.");
requireMatch(diagram, /CatalogDecant/, "The draw.io diagram must identify CatalogDecant.");
requireMatch(qr, /<svg\b/, "The QR asset must be an SVG.");
requireMatch(qr, /https:\/\/montesgp\.github\.io\/digital-catalog\//, "The QR asset must declare its intended destination.");
if ((await stat(resolve(root, "docs/digital-catalog-qr.svg"))).size < 1000) {
  failures.push("The QR SVG is unexpectedly small.");
}

for (const [needle, message] of [
  ["node scripts/check-structure.mjs", "CI must run the offline structure validator."],
  ["branches: [dev, main]", "CI must cover dev and main."],
  ["permissions:", "CI must declare permissions."],
  ["contents: read", "CI must use read-only contents permission."],
]) {
  if (!ci.includes(needle)) failures.push(message);
}

for (const [needle, message] of [
  ["actions/github-script@v8", "PR validation must use the maintained GitHub Script action."],
  ["type:*", "PR validation must require exactly one type label."],
  ["PRs to main must come from the 'dev' branch", "PR validation must enforce dev-to-main promotion."],
]) {
  if (!prValidation.includes(needle)) failures.push(message);
}

for (const [needle, message] of [
  ["branches: [main]", "Pages deployment must run only from main."],
  ["actions/configure-pages@v5", "Pages workflow must configure GitHub Pages with the official action."],
  ["actions/upload-pages-artifact@v4", "Pages workflow must upload the official Pages artifact."],
  ["actions/deploy-pages@v4", "Pages workflow must deploy with the official Pages action."],
  ["contents: read", "Pages build must have minimal read access."],
  ["pages: write", "Pages deploy must have Pages write permission."],
  ["id-token: write", "Pages deploy must have OIDC permission."],
]) {
  if (!deploy.includes(needle)) failures.push(message);
}
if (deploy.includes("script.google.com")) {
  failures.push("Pages workflow must not contain an operational data endpoint.");
}

if (failures.length > 0) {
  console.error("Structure validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Structure validation passed. No network requests were made.");
}
