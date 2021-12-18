import { Configuration } from 'webpack';
import { logger } from '@foxpage/foxpage-component-shared';
import { BuildFoxpageMode } from '@foxpage/foxpage-component-webpack';
import { loadWebpackConfig, runWebpackBuild } from './webpack';
import chalk from 'chalk';
import { FoxpageBuildCompileOption } from './typing';

type ArgumentsType<F extends (...args: any[]) => any> = F extends (...args: infer R) => any ? R : any;

export type BuildWebpackModeArgs = ArgumentsType<typeof buildWebpackMode>;
export const buildWebpackMode = async (mode: BuildFoxpageMode, context: string, option: FoxpageBuildCompileOption) => {
  logger.info(`build mode: "${chalk.yellowBright(mode)}"`);

  let config: Configuration | undefined;
  try {
    const { manifest, fileHash, progressPlugin, foxpageData } = option;
    const { name, version, foxpage } = foxpageData;
    const { publicPath } = foxpage;
    const library = `${name}`;
    config = loadWebpackConfig(mode, context, {
      library,
      version,
      publicPath,
      useManifest: manifest,
      useFileHash: fileHash,
      useProgressPlugin: progressPlugin,
    });
    if (config) {
      await runWebpackBuild(config, mode);
    }
  } catch (error) {
    logger.debug('webpack config: %j', config);
    logger.error('build mode "%s" fail。 ', mode);

    if (Array.isArray(error)) {
      for (const err of error) {
        logger.error('  error:', err);
      }
    } else {
      logger.error('  error:', error);
    }
  }
};
