#!/usr/bin/env node
const process = require("process");
const commander = require("commander");
const pkgJson = require("../package.json");

const program = new commander.Command();

program
  .name('foxpage-cmpt')
  .description(`foxpage-component tool`)
  .command("project <name>", "create a new foxpage-component-[name] project")
  .command("build", "foxpage component tool, build for foxpage component")
  .command("package <commander>", "foxpage component package tool")
  .parse(process.argv);
