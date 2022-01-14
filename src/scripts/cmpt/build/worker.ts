import { Configuration } from 'webpack';
import { logger } from '@foxpage/foxpage-component-shared';
import { BuildMode } from '@foxpage/foxpage-component-webpack';
import { loadWebpackConfig, runWebpackBuild } from './webpack';
import chalk from 'chalk';
import { FoxpageBuildCompileOption } from './typing';

type ArgumentsType<F extends (...args: any[]) => any> = F extends (...args: infer R) => any ? R : any;

export type BuildWebpackModeArgs = ArgumentsType<typeof buildWebpackMode>;
export const buildWebpackMode = async (mode: BuildMode, context: string, option: FoxpageBuildCompileOption) => {
  logger.info(`build mode: "${chalk.yellowBright(mode)}"`);

  let config: Configuration | undefined;
  try {
    const { manifest, fileHash, progressPlugin, foxpageData, output, cssInJs, analyze } = option;
    const { name, foxpage } = foxpageData;
    const { publicPath } = foxpage;
    const library = `${name}`;
    config = loadWebpackConfig(mode, context, {
      outputPath: output,
      library,
      publicPath,
      useManifest: manifest,
      useFileHash: fileHash,
      useProgressPlugin: progressPlugin,
      extractCSS: cssInJs === undefined ? undefined : !cssInJs,
      useStyleLoader: cssInJs,
      analyze,
    });
    if (config) {
      await runWebpackBuild(config, mode);
    }
    if (analyze && process.env.USE_BUNDLE_ANALYZER === 'true') {
      // stop when use analyze
      return new Promise(() => {});
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
    throw error;
  }
};
