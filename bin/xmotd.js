#!/usr/bin/env node

const { run } = require("../dist/src/cli");

run(process.argv.slice(2)).catch((error) => {
  const message = error && error.message ? error.message : String(error);
  console.error(`xmotd: ${message}`);
  process.exitCode = 1;
});
