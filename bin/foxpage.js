#!/usr/bin/env node

const process = require("process");
const commander = require("commander");
const pkgJson = require("../package.json");

const program = new commander.Command();

program
  .name('foxpage')
  .version(pkgJson.version, "-v, --version")
  .description(`foxpage cli @${pkgJson.version}`)
  .usage("<command> [options]")
  .command("server <command>", "foxpage serve tool")
  .command('cmpt <command>', 'foxpage component tool')
  .parse(process.argv);