/**
 * Reads an Observer edition aloud with Kokoro (open-source text-to-speech,
 * runs on the CPU, no API or cost) and writes an MP3.
 *
 *   node scripts/observer/audio.mjs content/observer/2026-09-21.json out.mp3
 *
 * kokoro-js is not a site dependency — it pulls in ONNX Runtime, which would
 * bloat every Vercel build. The workflow installs it just for this step.
 * Needs ffmpeg on the PATH (preinstalled on GitHub's Ubuntu runners).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const VOICE = "af_heart"; // Kokoro's highest-graded English voice
const SAMPLE_RATE = 24000;

const [editionPath, outPath] = process.argv.slice(2);
if (!editionPath || !outPath) {
  console.error("Usage: node scripts/observer/audio.mjs <edition.json> <out.mp3>");
  process.exit(1);
}
const edition = JSON.parse(fs.readFileSync(editionPath, "utf8"));

// ── Markdown → speakable text ────────────────────────────────────────────────

// Written shorthand the voice would otherwise spell out or mispronounce.
const SPOKEN = [
  [/S&P/g, "S and P"],
  [/\bYoY\b/gi, "year on year"],
  [/\bQoQ\b/gi, "quarter on quarter"],
  [/(\d)\s?pp\b/g, "$1 percentage points"],
  [/(\d)\s?bps?\b/g, "$1 basis points"],
  [/\bUSD\/JPY\b/g, "the dollar against the yen"],
  [/\bEUR\/USD\b/g, "the euro against the dollar"],
  [/\bUSD\/CNY\b/g, "the dollar against the yuan"],
  [/\bECB\b/g, "E C B"],
  [/\bGDP\b/g, "G D P"],
  [/\bCPI\b/g, "C P I"],
  [/\bHICP\b/g, "H I C P"],
  [/\bPMI\b/g, "P M I"],
  [/\bVIX\b/g, "the VIX"],
  [/the the VIX/gi, "the VIX"],
  [/\bAI\b/g, "A I"],
  [/(\d),(\d{3})/g, "$1$2"], // 7,551 → 7551 so digits are read as one number
  [/—|–/g, ", "],
  [/&/g, " and "],
];

function toSpeech(markdown) {
  let text = markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → their text
    .replace(/[*_`>#]/g, "")
    .replace(/^\s*[-•]\s+/gm, "");
  for (const [pattern, replacement] of SPOKEN) text = text.replace(pattern, replacement);
  return text.replace(/[ \t]+/g, " ").trim();
}

// Paragraphs, with headings kept as their own short paragraph so they get a pause.
const sections = [
  `The Observer. ${edition.title}.`,
  edition.dek,
  ...edition.body.split(/\n\s*\n/),
  edition.watchNextWeek?.length ? `On the calendar next week: ${edition.watchNextWeek.join(". ")}.` : "",
  "This edition of The Observer was written by an A I agent from public data and news, and reviewed before publication. It is general commentary, not investment advice.",
]
  .map((p) => toSpeech(p))
  .filter(Boolean);

// ── Synthesis ────────────────────────────────────────────────────────────────

console.log(`[audio] loading Kokoro, ${sections.length} paragraphs`);
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });

const silence = (seconds) => new Float32Array(Math.round(seconds * SAMPLE_RATE));
const chunks = [];
const started = Date.now();

for (const [i, paragraph] of sections.entries()) {
  const isHeading = paragraph.length < 60 && !/[.!?]$/.test(paragraph);
  // Sentence by sentence, which Kokoro handles best. Pass a closed splitter:
  // kokoro-js 1.2.1 never closes the one it builds from a plain string, and hangs.
  const sentences = new TextSplitterStream();
  sentences.push(paragraph);
  sentences.close();
  for await (const { audio } of tts.stream(sentences, { voice: VOICE })) {
    chunks.push(audio.audio);
  }
  chunks.push(silence(isHeading ? 0.5 : 0.8));
  console.log(`[audio] ${i + 1}/${sections.length}`);
}

// ── Encode ───────────────────────────────────────────────────────────────────

const total = chunks.reduce((n, c) => n + c.length, 0);
const pcm = new Float32Array(total);
let offset = 0;
for (const c of chunks) {
  pcm.set(c, offset);
  offset += c.length;
}

// Raw 32-bit float PCM → ffmpeg → mono MP3. 64 kbps is plenty for speech.
const rawPath = path.join(os.tmpdir(), `observer-${process.pid}.f32le`);
fs.writeFileSync(rawPath, Buffer.from(pcm.buffer));
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "f32le", "-ar", String(SAMPLE_RATE), "-ac", "1", "-i", rawPath,
  "-codec:a", "libmp3lame", "-b:a", "64k",
  "-metadata", `title=${edition.title}`,
  "-metadata", "artist=The Observer — FinancePlots",
  "-metadata", `date=${edition.date}`,
  outPath,
]);
fs.rmSync(rawPath);

const seconds = Math.round(total / SAMPLE_RATE);
console.log(
  `[audio] wrote ${outPath}: ${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, "0")}s of audio ` +
    `in ${Math.round((Date.now() - started) / 1000)}s`,
);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `duration=${seconds}\n`);
}
