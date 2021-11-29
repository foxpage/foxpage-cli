#!/usr/bin/env node

const process = require("process");
const commander = require("commander");
const pkgJson = require("../package.json");

const program = new commander.Command();

program
  .name('foxpage-cmpt package')
  .description(`foxpage component package tools`)
  .command("new", "create a new component")
  .parse(process.argv);