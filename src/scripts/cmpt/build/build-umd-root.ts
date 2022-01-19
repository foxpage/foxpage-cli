import fs from 'fs-extra';
import { join, basename } from 'path';
import pMap from 'p-map';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import {
  generatePackageHashMap,
  generatePackagesData,
  generatePackagesResource,
  generatePackagesPath,
} from './root-generator';
import { Constants } from './constants';

const buildUmdRoot = async (option: FoxpageBuildOption) => {
  const { buildType } = option;
  logger.info(`start build for ${buildType}`);
  // force update concurrency
  option.concurrency = Math.min(option.maxConcurrency, option.concurrency);
  const { clean, context, output, rootCache, npmClient, concurrency } = option;
  if (!rootCache) {
    fs.removeSync(output);
  }
  const packagesPath = await generatePackagesPath({ context });
  const packagesHashMap = await generatePackageHashMap({
    output,
    cacheFilePath: join(context, `${Constants.rootUmdCacheFilePath}`),
    clean: Boolean(clean),
    packagesPath,
    concurrency,
  });
  const packagesData = await generatePackagesData({
    useCache: rootCache,
    packagesPath,
    packagesHashMap,
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
  const { pkgBuildStatusMap } = await generatePackagesResource({
    npmClient,
    commandKeyword: 'umd',
    packagesData: unCachePackagesData,
    concurrency,
  });
  const newPackagesHashMap = {
    ...packagesHashMap,
  };
  // move <package>/dist to <root>/dist/<package>
  await pMap(
    packagesData,
    async ({ name, hash, packagePath, useCache }) => {
      const packageDir = basename(packagePath);
      if (useCache) {
        newPackagesHashMap[name] = hash;
        logger.info(`The '${name}' is in cache`);
      } else if (!pkgBuildStatusMap[name]) {
        logger.error(`Can't copy! Run build:foxpage fail in '<root>/${Constants.packagesPath}/${packageDir}'!`);
      } else {
        // the 'dist' will changed by --output(build:foxpage)? (wait to fix it)
        const source = join(packagePath, 'umd');
        const target = join(output, `${Constants.outputCompDirName}/${packageDir}`);
        if (await fs.pathExists(target)) {
          await fs
            .remove(target)
            .then()
            .catch(err => {
              logger.error(`Clear ${target} error!`);
              console.error(err);
            });
        }
        await fs
          .copy(source, target)
          .then(() => {
            newPackagesHashMap[name] = hash;
          })
          .catch(err => {
            logger.error(`Generate "${target}" error!`);
            console.error(err);
          });
      }
    },
    {
      concurrency,
    },
  );

  // generate new hash cache file
  await fs
    .outputJSON(join(context, Constants.rootUmdCacheFilePath), newPackagesHashMap, {
      spaces: 2,
    })
    .then(() => {
      logger.success(`Generate '${Constants.rootUmdCacheFilePath}' success!`);
    })
    .catch(err => {
      logger.error(`Generate '${Constants.rootUmdCacheFilePath}' error!`);
      console.error(err);
    });

  logger.success(`Build for ${buildType} success...`);
};

export default buildUmdRoot;
