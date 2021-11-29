import webpack, { Configuration } from 'webpack';
import chalk from 'chalk';
import { logger, paths } from '@foxpage/foxpage-component-shared';
import { BuildMode, getModeWebpackConfig, WebpackBaseConfigOption } from '@foxpage/foxpage-component-webpack';
import { existsSync } from 'fs-extra';
import { join } from 'path';

export const runWebpackBuild = (defaultConfig: Configuration | Configuration[], mode: BuildMode) => {
  logger.debug(`BUILD_MODE: ${process.env.BUILD_MODE}`);
  logger.debug(`mode: ${mode}`);
  process.env.BUILD_MODE = process.env.BUILD_MODE || mode;
  process.env.NODE_ENV = 'production';

  const webpackConfig = defaultConfig;

  logger.info(`start webpack build for mode: "${chalk.yellowBright(mode)}".`);
  // logger.debug('build: "%s" config: %j', mode, webpackConfig);

  if (Array.isArray(webpackConfig)) {
    const complier = webpack(webpackConfig);
    return new Promise((resolve, reject) => {
      complier.run((err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        if (stats.hasErrors()) {
          const { errors } = stats.toJson();
          errors.forEach(err => {
            logger.error('webpack error: ', err);
          });
          if (errors && errors.length > 0) {
            reject(errors);
            return;
          }
        }
        resolve(complier);
      });
    });
  }

  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (stats.hasErrors()) {
        const { errors } = stats.toJson();
        errors.forEach(err => {
          logger.error('webpack error: ', err);
        });
        if (errors && errors.length > 0) {
          reject(errors);
          return;
        }
      }
      resolve(compiler);
    });
  });
};

export const loadWebpackConfig = (mode: BuildMode, context: string, option: WebpackBaseConfigOption) => {
  let config = getModeWebpackConfig(mode, context, option);
  const globalCustomWebpackPath = join(paths.root, '.foxpage/webpack.js');
  const customWebpackPath = join(context, '.foxpage/webpack.js');
  if (existsSync(globalCustomWebpackPath)) {
    let globalCustom;
    try {
      const exported = require(globalCustomWebpackPath);
      globalCustom = exported && exported.default ? exported.default : exported;
    } catch (error) {
      logger.error('load file: "%s" fail', customWebpackPath, error);
      process.exit(1);
    }
    if (typeof globalCustom === 'function') {
      config = globalCustom(mode, config) || config;
    }
  }
  if (existsSync(customWebpackPath)) {
    let custom;
    try {
      const exported = require(customWebpackPath);
      custom = exported && exported.default ? exported.default : exported;
    } catch (error) {
      logger.error('load file: "%s" fail', customWebpackPath, error);
      process.exit(1);
    }
    if (typeof custom === 'function') {
      config = custom(mode, config) || config;
    }
  }
  return config || undefined;
};
