import { Configuration } from 'webpack';
import { join } from 'path';
import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { BuildStyleMode } from '@foxpage/foxpage-component-webpack';
import { FoxpageBuildOption } from './typing';
import { loadWebpackConfig, runWebpackBuild } from './webpack';

export interface StyleCompileOption extends FoxpageBuildOption {
  output: string;
}

async function runStyleCompile(option: StyleCompileOption) {
  const { context, output, fileHash, assetsHash, removeStyleImport, importIndexCss } = option;
  const mode: BuildStyleMode = 'style';
  logger.info('style compile:');
  let config: Configuration | undefined;
  try {
    config = loadWebpackConfig(mode, context, {
      outputPath: output,
      useFileHash: fileHash,
      useAssetsHash: assetsHash,
    });
    if (config) {
      await runWebpackBuild(config, mode);
    }
  } catch (error) {
    logger.debug('webpack config: %j', config);
    logger.error(`build mode ${mode} fail!\n`, error);
    process.exit(1);
  }
  logger.success('style compile success...');
  if (removeStyleImport && importIndexCss) {
    await updateStyleImport(option);
  }
}

async function updateStyleImport(option: StyleCompileOption) {
  const { output, esModule } = option;
  const indexJsPath = join(output, 'index.js');
  const indexCssExist = fs.pathExistsSync(join(output, 'index.css'));
  const indexJsExist = fs.pathExistsSync(indexJsPath);
  if (indexCssExist && indexJsExist) {
    const content = await fs.readFile(indexJsPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const insertIndex = lines.findIndex((line: string) => {
      return line.indexOf('import') < 0 && line.indexOf('require') < 0 && line.indexOf('use strict') < 0;
    });
    if (esModule) {
      lines.splice(insertIndex, 0, `import "./index.css";`);
    } else {
      lines.splice(insertIndex, 0, `require("./index.css");`);
    }
    const newContent = lines.join('\n');
    await fs.writeFile(indexJsPath, newContent, { encoding: 'utf-8', flag: 'w' });
  }
}

export default runStyleCompile;
