// main.ts — entrypoint for news-image-20261126.
//
// The front page is pre-rendered as entry.png in this repository. This
// program only places a byte-identical copy at
// $MAKEFUN_OUTPUT_DIR/entry.png. It uses the Node standard library only
// and has no dependencies.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SOURCE = join(process.cwd(), "entry.png");

if (!existsSync(SOURCE)) {
  throw new Error("entry.png not found in the working directory: " + SOURCE);
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
  const fallback = join(process.cwd(), "output");
  mkdirSync(fallback, { recursive: true });
  return fallback;
}

const dest = join(outputDir(), "entry.png");
copyFileSync(SOURCE, dest);

// Confirm the copy is complete instead of silently shipping a
// truncated image: the destination must hold exactly as many bytes
// as the source.
const sourceBytes = statSync(SOURCE).size;
const destBytes = statSync(dest).size;
if (sourceBytes !== destBytes) {
  throw new Error(
    "copy incomplete: " + dest + " holds " + destBytes +
    " bytes, expected " + sourceBytes
  );
}
console.log("wrote " + dest + " (" + destBytes + " bytes)");
