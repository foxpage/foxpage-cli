#!/usr/bin/env node

const process = require("process");
const commander = require("commander");
const main = require("../lib/scripts/server/fetch").default;

const program = new commander.Command();

program
  .name('foxpage-server fetch')
  .arguments('[name]')
  .action(main)
  .parse(process.argv);