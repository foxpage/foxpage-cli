import fs from 'fs-extra';
import { join, basename } from 'path';
import pMap from 'p-map';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from '../typing';
import {
  generateDistPackageHashMap,
  generatePackagesData,
  generatePackagesDist,
  generatePackagesPath,
} from './generator';
import { Constants } from './constants';

const buildFoxpageRoot = async (option: FoxpageBuildOption) => {
  logger.info(`start build for <root>/${Constants.rootDistPath}`);
  // force update concurrency
  option.concurrency = Math.min(option.maxConcurrency, option.concurrency);
  const { clean, context, rootCache, npmClient, concurrency } = option;
  if (!rootCache) {
    fs.removeSync(join(context, Constants.rootDistPath));
  }
  const packagesPath = await generatePackagesPath({ context });
  const distPackageHashMap = await generateDistPackageHashMap({
    context,
    clean: Boolean(clean),
    packagesPath,
    concurrency,
  });
  const packagesData = await generatePackagesData({
    useCache: rootCache,
    packagesPath,
    distPackageHashMap,
    concurrency,
  });
  if (!packagesData || packagesData.length < 1) {
    logger.info(`Can't find any package to build!`);
    return;
  }
  const unCachePackagesData = packagesData.filter(({ useCache }) => !useCache);
  if (unCachePackagesData.length < 1) {
    logger.info('All package is in cache!');
    return;
  }
  const { pkgBuildStatusMap } = await generatePackagesDist({
    npmClient,
    packagesData: unCachePackagesData,
    concurrency,
  });
  const newDistPackageHashMap = {
    ...distPackageHashMap,
  };
  // move <package>/dist to <root>/dist/<package>
  await pMap(
    packagesData,
    async ({ name, hash, packagePath, useCache }) => {
      const packageDir = basename(packagePath);
      if (useCache) {
        newDistPackageHashMap[name] = hash;
        logger.info(
          `The '${packageDir}/dist' use the cache of <root>/${Constants.rootDistComponentPath}/${packageDir}`,
        );
      } else if (!pkgBuildStatusMap[name]) {
        logger.error(`Can't copy! Run build:foxpage fail in '<root>/${Constants.packagesPath}/${packageDir}'!`);
      } else {
        const source = join(packagePath, 'dist');
        const target = join(packagePath, `../../${Constants.rootDistComponentPath}/${packageDir}`);
        if (await fs.pathExists(target)) {
          await fs
            .remove(target)
            .then(() => {
              logger.success(`Remove <root>/${Constants.rootDistComponentPath}/${packageDir} success!`);
            })
            .catch(err => {
              logger.error(`Remove <root>/${Constants.rootDistComponentPath}/${packageDir} error!`);
              console.error(err);
            });
        }
        await fs
          .copy(source, target)
          .then(() => {
            logger.success(
              `Copy ${packageDir}/dist to <root>/${Constants.rootDistComponentPath}/${packageDir} success!`,
            );
            newDistPackageHashMap[name] = hash;
          })
          .catch(err => {
            logger.error(`Copy ${packageDir}/dist to <root>/${Constants.rootDistComponentPath}/${packageDir} error!`);
            console.error(err);
          });
      }
    },
    {
      concurrency,
    },
  );
  // generate new dist packages hash file
  await fs
    .outputJSON(join(context, Constants.rootCacheFilePath), newDistPackageHashMap, {
      spaces: 2,
    })
    .then(() => {
      logger.success(`Generate '${Constants.rootCacheFilePath}' success!`);
    })
    .catch(err => {
      logger.error(`Generate '${Constants.rootCacheFilePath}' error!`);
      console.error(err);
    });

  logger.success(`Build for <root>/${Constants.rootDistPath} success...`);
};

export default buildFoxpageRoot;
