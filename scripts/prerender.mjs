/**
 * prerender.mjs — snapshot every public route into static HTML after `vite build`.
 *
 * Flow:
 *  1. Read route list from public/sitemap.xml (single source of truth — cannot drift).
 *  2. Serve ./dist over a local HTTP server on an ephemeral port (Node built-ins only),
 *     falling back to index.html for unknown paths so client routing works.
 *  3. Open each route in one shared Puppeteer browser, wait for network idle,
 *     require an <h1> or <main>, then save outerHTML to dist/<route>/index.html.
 *  4. Strip index.html's default meta tags wherever the page set its own via Helmet
 *     (Helmet marks its tags data-rh="true"), so each page has ONE description etc.
 *
 * Any route that renders empty fails the build (non-zero exit).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const DIST = path.resolve("dist");
const SITE = "https://amicusedge.com";

// --- 1. Routes from the sitemap -------------------------------------------
const sitemap = fs.readFileSync(path.resolve("public/sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace(SITE, "") || "/"
);
if (!routes.length) {
  console.error("[prerender] No <loc> entries found in sitemap.xml");
  process.exit(1);
}

// Pristine shell, read BEFORE we overwrite dist/index.html with the "/" snapshot.
const shell = fs.readFileSync(path.join(DIST, "index.html"));

// --- 2. Static server --------------------------------------------------------
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json",
  ".txt": "text/plain", ".xml": "application/xml", ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(DIST, urlPath);
  if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    return fs.createReadStream(file).pipe(res);
  }
  // SPA fallback — always the untouched shell
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(shell);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// --- 3. Render ---------------------------------------------------------------
const started = Date.now();
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
let failed = false;

try {
  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.goto(base + route, { waitUntil: "networkidle0", timeout: 60000 });
      const ok = await page
        .waitForSelector("h1, main", { timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) throw new Error("no <h1> or <main> rendered");
      await new Promise((r) => setTimeout(r, 500)); // settle (Helmet flush, fonts)

      // --- 4. Dedupe head: drop shell defaults the page overrode -------------
      await page.evaluate(() => {
        const head = document.head;
        head.querySelectorAll('meta[data-rh="true"]').forEach((rh) => {
          const key = rh.getAttribute("name") ? "name" : "property";
          const val = rh.getAttribute(key);
          if (!val) return;
          head.querySelectorAll(`meta[${key}="${val}"]:not([data-rh])`).forEach((d) => d.remove());
        });
        // Keep only the Helmet canonical if more than one exists
        const canons = head.querySelectorAll('link[rel="canonical"]');
        if (canons.length > 1) canons.forEach((c) => !c.hasAttribute("data-rh") && c.remove());
        // Remove runtime-injected widget <script>s so the inline loader in the
        // shell re-runs on each visit (keeps embed=1 detection live, avoids duplicates).
        head.querySelectorAll('script[src*="convai-widget-embed"], script[data-amicus-chatbot-id]').forEach((s) => s.remove());
      });

      const html = "<!DOCTYPE html>\n" + (await page.evaluate(() => document.documentElement.outerHTML));
      const out = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route, "index.html");
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
      console.log(`[prerender] ${route.padEnd(28)} ${Buffer.byteLength(html)} bytes`);
    } catch (e) {
      failed = true;
      console.error(`[prerender] FAILED ${route}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`[prerender] ${routes.length} routes in ${((Date.now() - started) / 1000).toFixed(1)}s`);
process.exit(failed ? 1 : 0);
