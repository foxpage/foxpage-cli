import { join } from 'path';
import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import runTypescriptCompile from './compile-typescript';
import runBabelCompile from './compile-babel';
import runStyleCompile from './compile-style';

const buildLibEsModule = async (option: FoxpageBuildOption) => {
  const { context, clean, tsDeclaration, esModule, cssStyle } = option;
  const relativeOutput = esModule ? '/es' : '/lib';
  logger.info(`[foxpage cli]: component build ${esModule ? 'es' : 'lib'}`);
  if (clean) {
    fs.removeSync(join(context, relativeOutput));
  }

  if (tsDeclaration) {
    await runTypescriptCompile({
      ...option,
      output: join(context, relativeOutput),
    });
  }

  await runBabelCompile(option);

  if (cssStyle) {
    await runStyleCompile({
      ...option,
      output: join(context, relativeOutput),
    });
  }
};

export default buildLibEsModule;
