// Renders a cartoon (marketing/<name>/index.html) to MP4: steps its render(t)
// frame by frame in headless Chromium, pipes the PNGs to ffmpeg, then muxes
// the folder's soundtrack.wav (from its music.py) if it exists.
//
//   node marketing/render.mjs <name> [out.mp4] [--lang es] [--fps 30] [--from 0 --to 44] [--stills 1,7.2,25]
//
// Needs ffmpeg on the PATH and Playwright (local or global install).
import { execSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = createRequire(join(execSync("npm root -g").toString().trim(), "_"))("playwright")); }

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const here = join(dirname(fileURLToPath(import.meta.url)), args[0] ?? "");
if (!args[0] || !existsSync(join(here, "index.html"))) { console.error("usage: node marketing/render.mjs <cartoon folder> [out.mp4] …"); process.exit(1); }
const out = args[1] && !args[1].startsWith("--") ? args[1] : join(here, `${args[0]}.mp4`);
const fps = Number(opt("fps", 30));
const stills = opt("stills");
const lang = opt("lang", "en");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(join(here, "index.html")).href + `?capture&lang=${lang}`);
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.DURATION);

if (stills) {
  const dir = join(here, "stills", lang); mkdirSync(dir, { recursive: true });
  for (const t of stills.split(",").map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: join(dir, `t${t.toFixed(2)}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const from = Number(opt("from", 0)), to = Number(opt("to", duration));
const audio = join(here, "soundtrack.wav");
const withAudio = existsSync(audio) && from === 0 && to === duration;
const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
  ...(withAudio ? ["-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
  "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.round((to - from) * fps);
for (let i = 0; i < frames; i++) {
  await page.evaluate(t => window.render(t), from + i / fps);
  const png = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once("drain", r));
  if (i % fps === 0) process.stdout.write(`\r${(i / fps).toFixed(0)}s / ${(frames / fps).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
console.log(`\nwrote ${out}`);
