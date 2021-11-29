#!/usr/bin/env node

const process = require("process");
const commander = require("commander");

const program = new commander.Command();

program
  .name('foxpage-server')
  .description(`foxpage server tool`)
  .usage("<command> [options]")
  .command("fetch [name]", "pull project")
  .command("install", "install dependencies")
  .parse(process.argv);