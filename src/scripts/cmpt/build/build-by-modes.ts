import { join } from 'path';
import { logger } from '@foxpage/foxpage-component-shared';
import { buildWebpackMode } from './worker';
import { FoxpageBuildCompileOption } from './typing';
import { createWorker } from '../../../worker/master';

interface BuildByModes {
  modes: FoxpageBuildCompileOption['modes'];
  ignoreModes?: FoxpageBuildCompileOption['modes'];
  whiteModes?: FoxpageBuildCompileOption['modes'];
  context: string;
  compileOption: FoxpageBuildCompileOption;
}

const buildByModes: (arg0: BuildByModes) => Promise<void> = async ({
  modes,
  ignoreModes = [],
  whiteModes = [],
  context,
  compileOption,
}) => {
  const { analyze } = compileOption;
  const worker = createWorker<typeof buildWebpackMode>({
    filename: join(__dirname, 'worker'),
    exportName: 'buildWebpackMode',
    // analyze use the modes's length as the worker agent size
    size: analyze ? modes.length : undefined,
  });
  const tarModes: FoxpageBuildCompileOption['modes'] = [];
  modes.forEach(mode => {
    const isInWhiteModes = !(whiteModes.length > 0) || whiteModes.includes(mode);
    const isInIgnoreModes = ignoreModes.includes(mode);
    if (!isInWhiteModes) {
      logger.warn(`${mode} is not in whiteModes: ${whiteModes.join(', ')}`);
    } else if (isInIgnoreModes) {
      logger.colorMsg('grey', `ignore mode: ${mode}`);
    } else {
      tarModes.push(mode);
    }
  });
  logger.info(`start build by modes: ${tarModes.join(', ')}`);
  tarModes.forEach(mode => {
    worker.addJob({
      args: [mode, context, compileOption],
    });
  });
  const resList = await worker.run();
  worker.destroy();
  let success = true;
  resList.forEach((res, ind) => {
    const modeName = res.args?.[0] || modes[ind];
    if (res.ok) {
      logger.success(`build ${modeName} mode...`);
    } else {
      logger.error(`build ${modeName} mode fail!`);
      success = false;
    }
  });
  if (!success) {
    process.exit(1);
  }
  logger.success('build by modes success...');
};

export default buildByModes;
