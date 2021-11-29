#!/usr/bin/env node

const process = require("process");
const commander = require("commander");
const main = require("../lib/scripts/cmpt/project").default;

const program = new commander.Command();

program
  .name('foxpage-cmpt project')
  .arguments('<name>')
  .action(main)
  .parse(process.argv);