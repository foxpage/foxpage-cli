import fs from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import AdmZip from 'adm-zip';
import filenamify from 'filenamify';
import { logger } from '@foxpage/foxpage-component-shared';
import { buildWebpackMode } from './worker';
import { generateSchemaJson } from './compile-schema';
import { FoxpageBuildOption, FoxpageBuildCompileOption } from './typing';
import { createWorker } from '../../../worker/master';
import { getCompileOption } from './compile-option';

const buildFoxpage = async (option: FoxpageBuildOption) => {
  logger.info('start build for foxpage');
  const { clean, context } = option;
  if (clean) {
    fs.removeSync(join(context, '/dist'));
  }
  const compileOption = await getCompileOption(option);

  await buildByModes(context, compileOption);
  await buildTsSchema(context, compileOption);
  await handleFoxpageStatic(context, compileOption);
  logger.success('build for foxpage success...');
};

const buildByModes = async (context: string, compileOption: FoxpageBuildCompileOption) => {
  const worker = createWorker<typeof buildWebpackMode>({
    filename: join(__dirname, 'worker'),
    exportName: 'buildWebpackMode',
  });
  const whiteModes: FoxpageBuildCompileOption['modes'] = ['production', 'node', 'debug', 'editor'];
  const { modes = [] } = compileOption;
  const targetModes = modes && modes.length > 0 ? modes : whiteModes;
  logger.info(`start build by modes: ${targetModes.join(', ')}`);
  targetModes.forEach(mode => {
    if (whiteModes.includes(mode)) {
      worker.addJob({
        args: [mode, context, compileOption],
      });
    }
  });
  await worker.run();
  worker.destroy();
  logger.success('build by modes success...');
};

const buildTsSchema = async (context: string, compileOption: FoxpageBuildCompileOption) => {
  await generateSchemaJson({
    context,
    name: compileOption.foxpageData.name,
    output: join(context, 'dist/schema.json'),
  });
};

const handleFoxpageStatic = async (context: string, compileOption: FoxpageBuildCompileOption) => {
  logger.info('generate foxpage.json...');
  const { generateFoxpageJson, foxpageData: foxpageJson = {} } = compileOption;
  // generate foxpage.json
  if (generateFoxpageJson) {
    await fs
      .writeJson(join(context, 'dist/foxpage.json'), foxpageJson || {})
      .then(() => {
        logger.success('generate foxpage.json...');
      })
      .catch(e => {
        logger.error(e.message);
        logger.error('generate foxpage.json...');
        return false;
      });
  }

  // zip dist
  if (compileOption.zipFox) {
    const spinner = ora('generate zip...').start();
    const { name, version } = compileOption.foxpageData;
    const fileName = `${name}@${version}.zip`;
    const goodFileName = filenamify(fileName, { replacement: '-' });
    spinner.text = `generate dist-zip/${goodFileName}...`;
    const zip = new AdmZip();
    zip.addLocalFolder(join(context, '/dist'));
    zip.addLocalFile(join(context, 'package.json'));
    zip.writeZip(join(context, `dist-zip/${goodFileName}`));
    spinner.succeed(`generate dist-zip/${goodFileName}...`);
    logger.success('generate zip success...');
  }
};

export default buildFoxpage;
