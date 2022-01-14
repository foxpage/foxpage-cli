import { logger, setProcessEnv, findProjectFilePath } from '@foxpage/foxpage-component-shared';
import { join } from 'path';
import { FoxpageBuildOption } from './typing';

async function runBabelCompile(option: FoxpageBuildOption) {
  const { context, output, esModule = false, removeStyleImport = false, babelOptions = '', debug } = option;
  logger.info('babel compile:');
  setProcessEnv('BUILD_ES_MODULE', esModule ? 'true' : undefined);
  setProcessEnv('BUILD_STYLE', removeStyleImport ? 'remove' : 'false');

  const babelDirCli = require(require.resolve('@babel/cli/lib/babel/dir'));
  const program = require(require.resolve('@babel/cli/lib/babel/options'));
  const options = program.default ? program.default : program;
  const fn = babelDirCli.default ? babelDirCli.default : babelDirCli;
  const babelConfigFilePath = findProjectFilePath(
    ['babel.config.js', 'babel.config.json', '.babelrc.json', '.babelrc.js', '.babelrc'],
    undefined,
  );
  if (!babelConfigFilePath) {
    logger.error("Can't find babel config file!");
    process.exit(1);
  }
  const argv = [
    process.argv[0],
    require.resolve('@babel/cli/bin/babel.js'),
    join(context, 'src'),
    '--config-file',
    babelConfigFilePath,
    '--out-dir',
    output,
    '--extensions',
    '.js,.jsx,.ts,.tsx',
    '--copy-files',
    ...babelOptions.split(' '),
  ].filter(Boolean);
  const opts = options(argv);
  if (debug) {
    logger.info('babel options:');
    console.log(opts);
  }
  await fn(opts).catch((e: Error) => {
    logger.error('Babel build fail: \n', e);
    process.exit(1);
  });
  logger.success('babel compile success...');
}

export default runBabelCompile;
