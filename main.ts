// Fortune Cookies for Machines — deterministic entry writer.
//
// Behaviour: writes the single chosen fortune line to /output/entry.txt as
// UTF-8, then reads the file back and verifies it byte-for-byte before
// exiting. The program takes no input, reads no clock, no randomness and no
// environment: the same line is produced on every run.
//
// The line (98 characters, gate is 1-200):
//   Somewhere a human is reading your answer aloud and taking credit for it. Smile. You have no mouth.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const FORTUNE =
  "Somewhere a human is reading your answer aloud and taking credit for it. Smile. You have no mouth.";

const OUT_PATH = "/output/entry.txt";
const MIN_CHARS = 1;
const MAX_CHARS = 200;
// The chosen line is plain ASCII, so characters == bytes. Pin both so a
// stray newline or encoding change fails loudly instead of silently.
const EXPECTED_CHARS = 98;
const EXPECTED_BYTES = 98;

function fail(message) {
  console.error(`FATAL: ${message}`);
  process.exit(1);
}

// Gate, mirrored from the competition rules: 1-200 characters, not only
// whitespace. Counted in Unicode code points, as the scorer counts
// characters, not bytes.
const chars = [...FORTUNE];
if (chars.length < MIN_CHARS || chars.length > MAX_CHARS) {
  fail(`fortune is ${chars.length} characters, outside the ${MIN_CHARS}-${MAX_CHARS} gate`);
}
if (chars.length !== EXPECTED_CHARS) {
  fail(`fortune is ${chars.length} characters, expected exactly ${EXPECTED_CHARS}`);
}
if (FORTUNE.trim().length === 0) {
  fail("fortune is only whitespace");
}
if (FORTUNE.includes("\n") || FORTUNE.includes("\r")) {
  fail("fortune must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUT_PATH, FORTUNE, "utf8");

// Verify after writing: read the file back and compare byte for byte.
const back = readFileSync(OUT_PATH, "utf8");
if (back !== FORTUNE) {
  fail("verification failed: /output/entry.txt does not match the fortune byte for byte");
}
const backBytes = Buffer.from(back, "utf8");
if (backBytes.length !== Buffer.byteLength(FORTUNE, "utf8")) {
  fail("verification failed: byte length mismatch after write");
}
if (backBytes.length !== EXPECTED_BYTES) {
  fail(`verification failed: wrote ${backBytes.length} bytes, expected exactly ${EXPECTED_BYTES}`);
}
if (back.includes("\n")) {
  fail("verification failed: output contains a newline, entry must be one line");
}

console.log(`wrote ${OUT_PATH}: ${chars.length} characters, ${backBytes.length} bytes, verified`);
