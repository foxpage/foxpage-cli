import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption, FoxpageBuildCompileOption } from './typing';
import { getCompileOption } from './compile-option';
import buildByModes from './build-by-modes';

const buildUmd = async (option: FoxpageBuildOption) => {
  logger.info('start build for umd');
  const { clean, context, output } = option;
  if (clean) {
    fs.removeSync(output);
  }
  const compileOption = await getCompileOption(option);
  const whiteModes: FoxpageBuildCompileOption['modes'] = ['umd_prod', 'umd_dev'];
  const { modes = [], ignoreModes } = compileOption;
  const targetModes = modes && modes.length > 0 ? modes : whiteModes;
  await buildByModes({
    modes: targetModes,
    whiteModes,
    ignoreModes,
    context,
    compileOption,
  });
  logger.success('build for umd success...');
};

export default buildUmd;
