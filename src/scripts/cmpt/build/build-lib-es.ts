import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import runTypescriptCompile from './compile-typescript';
import runBabelCompile from './compile-babel';
import runStyleCompile from './compile-style';

const buildLibEsModule = async (option: FoxpageBuildOption) => {
  const { buildType, output, clean, tsDeclaration, cssStyle } = option;
  logger.info(`[foxpage cli]: start build for ${buildType}`);
  if (clean) {
    fs.removeSync(output);
  }

  if (tsDeclaration) {
    await runTypescriptCompile(option);
  }

  await runBabelCompile(option);

  if (cssStyle) {
    await runStyleCompile(option);
  }
};

export default buildLibEsModule;
