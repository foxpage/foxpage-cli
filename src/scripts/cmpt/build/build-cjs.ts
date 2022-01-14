import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption, FoxpageBuildCompileOption } from './typing';
import { getCompileOption } from './compile-option';
import buildByModes from './build-by-modes';

const buildCjs = async (option: FoxpageBuildOption) => {
  logger.info('start build for cjs');
  const { clean, context, output } = option;
  if (clean) {
    fs.removeSync(output);
  }
  const compileOption = await getCompileOption(option);
  const whiteModes: FoxpageBuildCompileOption['modes'] = ['cjs_prod', 'cjs_dev'];
  const { modes = [] } = compileOption;
  const targetModes = modes && modes.length > 0 ? modes : whiteModes;
  await buildByModes({
    modes: targetModes,
    whiteModes,
    context,
    compileOption,
  });
  logger.success('build for cjs success...');
};

export default buildCjs;
