#!/usr/bin/env node

const { spawn } = require('child_process'),
    path = require("path"),
    runner = spawn("node", ["--experimental-modules", path.resolve(".", "source/util/cli.mjs"), ...process.argv.slice(2)]);

runner.stdin.pipe(process.stdin);

runner.stdout.pipe(process.stdout);

runner.stderr.pipe(process.stderr);

runner.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
