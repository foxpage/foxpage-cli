#!/usr/bin/env node
import process from 'process';
import { cpus } from 'os';
import commander from 'commander';
import buildFoxpage from './index';

const program = new commander.Command();
// Too many concurrences are meaningless and memory consuming
const DefaultMaxConcurrency = 8;
const DefaultConcurrency = Math.min(DefaultMaxConcurrency, Math.max(cpus().length - 1, 2));
program
  .name('foxpage-cmpt-build')
  // main process
  .option('--foxpage', 'Build umd for foxpage')
  .option('--foxpage-root', 'Build umd for foxpage in root')
  .option('--umd', 'Build umd')
  .option('--cjs', 'Build cjs')
  .option('--lib', 'Build lib(cjs) for npm')
  .option('--es-module', 'Build es(es-module) for npm')
  .option('--schema-md', 'Build schema.md to describe the api of component')
  // common
  .option('--clean', 'Clean dist directory', true)
  .option('--no-clean', 'Set --clean to false')
  .option('--output <output>', 'output path')
  .option('--assets-hash', 'Build files in assets using the WebPack Contenthash parameter')
  .option('--debug', 'Debug: some temp file or data will be retained')
  // foxpage-root
  .option('--root-cache', 'Cache <root>/dist directory for all package', true)
  .option('--no-root-cache', 'Set --root-cache to false')
  .option('--npm-client <npmClient>', 'Executable used to run scripts (npm, yarn, ...).', 'npm')
  .option(
    '--max-concurrency <concurrency>',
    'Limit the max number of concurrently (The "OOM Killer" mechanism will kill child processes and cause error: [ERR_IPC_CHANNEL_CLOSED]: channel closed)',
    val => Number(val) || DefaultMaxConcurrency,
    DefaultMaxConcurrency,
  )
  .option(
    '--concurrency <concurrency>',
    `Number of concurrently pending subprocess. If concurrently is greater than ${DefaultMaxConcurrency}, please set --max-concurrency to increase the ceiling. (default: Min(${DefaultMaxConcurrency}, Max(os.cpus().length - 1, 2)))`,
    val => Number(val) || DefaultConcurrency,
    DefaultConcurrency,
  )
  // umd, cjs, foxpage
  .option(
    '--modes <modes>',
    'Build modes, includes: "production,debug,node,editor", split by ",", (only support --foxpage)',
    v => v.split(','),
  )
  .option('--manifest', 'generate manifest.json. used with --file-hash')
  .option('--file-hash', 'Build all files using the WebPack Contenthash parameter')
  .option('--progress-plugin', 'Use webpack.ProgressPlugin when webpack build')
  .option(
    '--analyze',
    'use webpack-bundle-analyzer to analyze webpack output files. (only support --umd, --cjs, --foxpage)',
    false,
  )
  .option('--css-in-js', 'use style loader to include style in js file(only support: --foxpage --umd)')
  // foxpage only
  .option('--generate-foxpage-json', 'generate foxpage.json file', true)
  .option('--on-generate-foxpage-json', 'disable generate foxpage.json file')
  .option(
    '--zip-fox',
    'Automatically compress build resources for the FoxPage component registration process, (only support --foxpage)',
  )
  .option('--no-zip-fox', 'Set --zip to false')
  .option('--zip-fox-output <zipFoxOutput>', 'the output path of zip-fox')
  // es/lib
  .option('--babel-options <babelOptions>', 'Customer babel cli options, (only support --es/lib)')
  .option('--ts-declaration', 'Generate typescript declaration (*.d.ts), (only support --es/lib)', true)
  .option('--no-ts-declaration', 'Set --ts-declaration to false')
  .option(
    '--css-style',
    'build style from index.(less/scss) to index.css. please used with --remove-style-import. mode name is style. (only support --es/lib)',
  )
  .option(
    '--remove-style-import',
    `Remove style import for all ".js" file. It's usually used with --css-style. (only support --es/lib)`,
  )
  .option(
    '--import-index-css',
    `When use --remove-style-import, add "import './index.css'" in root index.js, (only support --es/lib)`,
  )
  .action(buildFoxpage)
  .parse(process.argv);
