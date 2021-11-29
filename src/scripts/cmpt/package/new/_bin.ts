#!/usr/bin/env node
import process from 'process';
import commander from 'commander';
import main from './index';

const program = new commander.Command();

program
  .name('foxpage-cmpt-package-new')
  .option(
    '--templates <templateDir>',
    'templates dir location. you can select subfolders to determine the path of the template',
  )
  .option('--template <templateDir>', 'template dir location')
  .option('--formate', 'formate code after create')
  .action(main)
  .parse(process.argv);
