import { execSync } from 'child_process';
import _ from 'lodash';
import TS from 'typescript';
import { CompilerOptions } from 'typescript';
import { findProjectFilePath, logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import { join } from 'path';
import { outputJSONSync } from 'fs-extra';
import os from 'os';
import fs from 'fs-extra';
import cryptoRandomString from 'crypto-random-string';
import { isWin } from '../../../utils/command-tool';

export interface TypescriptCompileOption extends FoxpageBuildOption {
  output: string;
}

export interface TypescriptConfig {
  extend?: string;
  include?: string[];
  exclude?: string[];
  compilerOptions: CompilerOptions;
}

function loadTypescriptConfigFile(configFileName: string) {
  const result = TS.parseConfigFileTextToJson(configFileName, TS.sys.readFile(configFileName) as string);
  const configObject: TypescriptConfig = result.config;
  const options: CompilerOptions = configObject.compilerOptions || {};

  // delete output
  delete options.out;
  delete options.output;
  delete options.outDir;
  delete options.outFile;

  // delete root
  delete options.rootDir;
  delete options.rootDirs;

  // delete path map
  delete options.baseUrl;
  delete options.paths;

  return options;
}

function generateTypescriptConfig(tsConfigFilePath: string, option: TypescriptCompileOption) {
  const { context, output, debug } = option;
  const userComplierOptions = loadTypescriptConfigFile(tsConfigFilePath);
  const overrideOptions: CompilerOptions = {
    rootDirs: [join(context, 'src'), join(context, 'typings')],
    outDir: output,
    skipLibCheck: true,
    declaration: true,
    emitDeclarationOnly: true,
  };
  const config: TypescriptConfig = {
    compilerOptions: _.merge(userComplierOptions, overrideOptions),
    include: [
      // 加载项目根目录的 type 声明文件
      join(tsConfigFilePath, '../typing.d.ts'),
      join(context, 'src'),
      join(context, 'typings'),
    ],
    exclude: [
      'node_modules',
      'lib',
      'es',
      'dist',
      '.cache',
      '__*',
      join(context, 'node_modules'),
      join(context, 'lib'),
      join(context, 'es'),
      join(context, 'dist'),
    ],
  };
  const tempFilePath = debug
    ? join(context, '.fox_temp', '_tsconfig.temp.json')
    : join(os.tmpdir(), `${cryptoRandomString({ length: 10 })}_tsconfig.json`);
  outputJSONSync(tempFilePath, config, { spaces: 2 });
  return {
    filePath: tempFilePath,
    clear: () => {
      if (!debug) {
        fs.removeSync(tempFilePath);
      }
    },
  };
}

async function runTypescriptCompile(option: TypescriptCompileOption) {
  const { context } = option;
  logger.info('generate typescript declaration:');
  const tsConfigFilePath = findProjectFilePath(['tsconfig.prod', 'tsconfig.production', 'tsconfig'], ['json']);
  if (!tsConfigFilePath) {
    logger.error("Can't find 'tsconfig.prod','tsconfig.production', 'tsconfig' file, ");
    logger.error('Generate typescript declaration fail!');
    process.exit(1);
  }

  const tmpFilePathIns = generateTypescriptConfig(tsConfigFilePath, option);

  try {
    let tsc = 'npx tsc';
    try {
      if (!isWin()) {
        tsc = require.resolve('typescript/bin/tsc');
      }
    } catch (e) {}
    execSync(`${tsc} --project ${tmpFilePathIns.filePath}`, {
      cwd: context,
      stdio: 'inherit',
    });
    tmpFilePathIns.clear();
  } catch (error) {
    logger.error('Generate typescript declaration fail:\n', error);
    process.exit(1);
  }
  logger.success('generate typescript declaration...');
}

export default runTypescriptCompile;
