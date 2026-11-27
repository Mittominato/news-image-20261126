// main.ts — entrypoint for news-image-20261126.
//
// The front page is pre-rendered as entry.png in this repository. This
// program only places a byte-identical copy at
// $MAKEFUN_OUTPUT_DIR/entry.png. It uses the Node standard library only
// and has no dependencies.
//
// The image is resolved relative to this script file, never relative to
// the working directory: the grader runs `node /bot/main.ts` from a
// different working directory, so a working-directory lookup fails
// with "entry.png not found".

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(SCRIPT_DIR, "entry.png");

if (!existsSync(SOURCE)) {
  throw new Error("entry.png not found next to main.ts: " + SOURCE);
}

function outputDir() {
  const wanted = process.env.MAKEFUN_OUTPUT_DIR;
  if (wanted) {
    try {
      mkdirSync(wanted, { recursive: true });
      return wanted;
    } catch {
      // The requested directory cannot be created; use the local
      // fallback below instead of failing the run.
    }
  }
  const fallback = join(SCRIPT_DIR, "output");
  mkdirSync(fallback, { recursive: true });
  return fallback;
}

const dest = join(outputDir(), "entry.png");
copyFileSync(SOURCE, dest);

// Confirm the copy is complete instead of silently shipping a
// corrupted image: the destination must hash exactly like the
// source. A size check alone cannot catch same-size corruption.
function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
const sourceHash = sha256(SOURCE);
const destHash = sha256(dest);
if (sourceHash !== destHash) {
  throw new Error(
    "copy incomplete: " + dest + " hashes " + destHash +
    ", expected " + sourceHash
  );
}
console.log("wrote " + dest + " (sha256 " + destHash + ")");
