import fs from 'fs-extra';
import { join, basename, isAbsolute } from 'path';
import ora from 'ora';
import AdmZip from 'adm-zip';
import filenamify from 'filenamify';
import { logger } from '@foxpage/foxpage-component-shared';
import { generateSchemaJson } from './compile-schema';
import { FoxpageBuildOption, FoxpageBuildCompileOption, FoxpageJson } from './typing';
import { getCompileOption } from './compile-option';
import { Constants } from './constants';
import buildByModes from './build-by-modes';

const buildFoxpage = async (option: FoxpageBuildOption) => {
  logger.info('start build for foxpage');
  const { clean, context, output } = option;
  if (clean) {
    fs.removeSync(output);
  }
  const compileOption = await getCompileOption(option);
  const whiteModes: FoxpageBuildCompileOption['modes'] = ['production', 'node', 'debug', 'editor'];
  const { modes = [] } = compileOption;
  const targetModes = modes && modes.length > 0 ? modes : whiteModes;
  await buildByModes({
    modes: targetModes,
    whiteModes,
    context,
    compileOption,
  });
  await buildTsSchema(context, compileOption);
  await handleFoxpageStatic(context, compileOption);
  logger.success('build for foxpage success...');
};

const buildTsSchema = async (context: string, compileOption: FoxpageBuildCompileOption) => {
  const schema = await generateSchemaJson({
    context,
    name: compileOption.foxpageData.name,
    output: join(compileOption.output, Constants.schemaJsonFilename),
  });
  // set schema
  compileOption.foxpageData.foxpage.schema = schema;
};

const handleFoxpageStatic = async (context: string, compileOption: FoxpageBuildCompileOption) => {
  logger.info(`generate ${Constants.foxpageJsonFilename}...`);
  const { generateFoxpageJson, foxpageData, output } = compileOption;
  const { name: pkgName, version: pkgVersion, foxpage: pkgFoxpage = {} } = foxpageData || ({} as FoxpageJson);
  const {
    name,
    version,
    dirName,
    publicPath,
    schema = {},
    meta = {},
    disableContainer = false,
    dependencies = [],
    editors = [],
  } = pkgFoxpage;
  const foxpageJson = {
    name: pkgName,
    version: pkgVersion,
    foxpage: {
      name: name || pkgName,
      version: version || pkgVersion,
      dirName,
      publicPath,
      schema,
      meta,
      disableContainer,
      dependencies,
      editors,
    },
  };
  // generate foxpage.json
  if (generateFoxpageJson) {
    await fs
      .writeJson(join(output, Constants.foxpageJsonFilename), foxpageJson)
      .then(() => {
        logger.success(`generate ${Constants.foxpageJsonFilename}...`);
      })
      .catch(e => {
        logger.error(e.message);
        logger.error(`generate ${Constants.foxpageJsonFilename}...`);
        return false;
      });
  }

  // zip dist
  if (compileOption.zipFox) {
    let zipFoxOutput = compileOption.zipFoxOutput;
    const outputDirName = basename(output);
    if (!zipFoxOutput) {
      zipFoxOutput = join(output, '../', `${outputDirName}${Constants.defaultZipFoxOutputSuffix}`);
    } else {
      if (!isAbsolute(zipFoxOutput)) {
        zipFoxOutput = join(context, zipFoxOutput);
      }
    }
    const spinner = ora('generate zip...').start();
    const { name, version } = compileOption.foxpageData;
    const fileName = `${name}@${version}.zip`;
    const goodFileName = filenamify(fileName, { replacement: '-' });
    spinner.text = `generate zip/${goodFileName}...`;
    const zip = new AdmZip();
    zip.addLocalFolder(output);
    zip.addLocalFile(join(context, 'package.json'));
    zip.writeZip(join(zipFoxOutput, `${goodFileName}`));
    spinner.succeed(`generate zip/${goodFileName}...`);
    logger.success('generate zip success...');
  }
};

export default buildFoxpage;
