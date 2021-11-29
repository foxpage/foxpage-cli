import { join, basename } from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import { Transform } from 'stream';
import { Buffer } from 'buffer';
import globby from 'globby';
import { hashElement } from 'folder-hash';
import pMap from 'p-map';
import pFilter from 'p-filter';
import logTransformer from 'strong-log-transformer';
import { logger, readPackageInfo } from '@foxpage/foxpage-component-shared';
import { PackageDataType, PackageHashMap, PackagesDataType } from './interface';
import { Constants, FolderHashOptions } from './constants';
import { getUniqueColorChalk } from '../../../../utils/chalk-color';
import { getFoxpageData } from '../utils';

export const generatePackagesPath = async ({ context }: { context: string }) => {
  const packagesPath = await globby(`${Constants.packagesPath}/*`, {
    cwd: context,
    onlyDirectories: true,
    absolute: true,
  });
  const filterPackagesPath = await pFilter(packagesPath, async (pkgPath: string) => {
    const foxpageJson = await getFoxpageData(pkgPath);
    if (foxpageJson.foxpage?.ignore !== undefined) {
      return !foxpageJson.foxpage?.ignore;
    }
    if (foxpageJson.isPrivate !== undefined) {
      return !foxpageJson.isPrivate;
    }
    return true;
  });
  return filterPackagesPath || [];
};

/**
 * 1. get hashMap of packages
 * 2. clean the expired 'root/dist/component/<package>'
 */
export const generateDistPackageHashMap = async ({
  context,
  clean,
  packagesPath = [],
  concurrency,
}: {
  context: string;
  clean: boolean;
  packagesPath: string[];
  concurrency: number;
}): Promise<PackageHashMap> => {
  let distPackageHashMap: PackageHashMap = {};
  // get packages hashMap by cache file;
  const cacheFilePath = join(context, Constants.rootCacheFilePath);
  const packageDirs = packagesPath.map((packagePath: string) => basename(packagePath));
  if (await fs.pathExists(cacheFilePath)) {
    await fs
      .readJson(cacheFilePath)
      .then((json = {}) => (distPackageHashMap = json))
      .catch(err => {
        logger.error(`Read '${Constants.rootCacheFilePath}' error!`);
        console.error(err);
      });
    // Make sure the distPackageHashMap is correct!
    await pMap(
      Object.keys(distPackageHashMap),
      async (key: string) => {
        // delete invalid key
        if (!packageDirs.includes(key)) {
          delete distPackageHashMap[key];
          return;
        }
        // parse and valid '<root>/dist/component/<package>' is exist and no empty, otherwise delete the  hash of package
        const cachePackagePath = join(context, `${Constants.rootDistComponentPath}/${key}`);
        const isInCache =
          (
            await fs.readdir(cachePackagePath).catch(() => {
              return [];
            })
          ).length === 0;
        if (isInCache) {
          delete distPackageHashMap[key];
          return;
        }
      },
      {
        concurrency,
      },
    );
  }
  if (clean) {
    const distPackages = await globby(`${Constants.rootDistComponentPath}/*`, {
      cwd: context,
      onlyDirectories: true,
    }).then((dirs: string[]) => {
      return dirs.map((dir: string) => basename(dir));
    });
    // delete invalid "component/<package>" of "root/dist";
    await pMap(
      distPackages,
      async (name: string) => {
        if (!packageDirs.includes(name)) {
          fs.remove(join(context, `${Constants.rootDistComponentPath}/${name}`));
        }
      },
      {
        concurrency,
      },
    );
  }
  return distPackageHashMap;
};

export const generatePackagesData = async ({
  useCache,
  packagesPath = [],
  distPackageHashMap = {},
  concurrency,
}: {
  useCache: boolean;
  packagesPath: string[];
  distPackageHashMap: PackageHashMap;
  concurrency: number;
}): Promise<PackagesDataType> => {
  const packagesData: PackagesDataType = [];
  await pMap(
    packagesPath,
    async (packagePath: string) => {
      return await hashElement(packagePath, FolderHashOptions)
        .then(hash => {
          const { name, hash: contentHash } = hash;
          const pkgName = readPackageInfo(packagePath, 'name') || '';
          if (!name || !contentHash || !pkgName) {
            const errMsg = `Generate PackageData for ${basename(packagePath)} is error`;
            logger.error(errMsg);
            throw new Error(errMsg);
          }
          packagesData.push({
            name,
            pkgName,
            hash: contentHash,
            packagePath,
            useCache: useCache && distPackageHashMap[name] === contentHash,
          });
        })
        .catch(e => {
          console.error(e);
        });
    },
    {
      concurrency,
    },
  );
  return packagesData;
};

export const generatePackagesDist = async ({
  npmClient = 'npm',
  packagesData = [],
  concurrency,
}: {
  npmClient: string;
  packagesData: PackageDataType[];
  concurrency: number;
}) => {
  const result = await pMap(
    packagesData,
    async (pkg: PackageDataType, index: number) => {
      const { name, packagePath } = pkg;
      const colorName = getUniqueColorChalk(name);
      try {
        const command = `${npmClient} run build:foxpage`;
        const spawned = execa.command(command, {
          cwd: packagePath,
        });
        const customStreamTransform = new Transform();
        customStreamTransform._transform = (chunk, _encoding, callback) => {
          const newStr = chunk.toString('utf8').replace(/<s> \[webpack.Progress\]/g, '[webpack.Progress]');
          const newChunk = Buffer.from(newStr, 'utf-8');
          callback(null, newChunk);
        };
        spawned.stdout
          ?.pipe(customStreamTransform)
          ?.pipe(
            logTransformer({
              tag: `(${index + 1})${colorName}:`,
            }),
          )
          .pipe(process.stdout);
        spawned.stderr
          ?.pipe(customStreamTransform)
          ?.pipe(
            logTransformer({
              tag: `(${index + 1})${colorName}:`,
            }),
          )
          .pipe(process.stderr);
        const res = await spawned;
        if (res.failed || res.exitCode !== 0) {
          return {
            isSuc: false,
            colorName,
            message: res.stderr || `Run '${res.command}' fail!`,
            name,
          };
        }
        return {
          isSuc: true,
          colorName,
          name,
        };
      } catch (e) {
        return {
          isSuc: false,
          colorName,
          message: e.stderr || e.message,
          name,
        };
      }
    },
    {
      concurrency,
    },
  );
  const resultMap: Record<string, boolean> = {};
  result.forEach(item => {
    const { isSuc, name, colorName, message } = item;
    resultMap[name] = isSuc;
    if (isSuc) {
      logger.success(`FoxpageBuild ${colorName} succeed!`);
    } else {
      logger.error(`FoxpageBuild ${colorName} fail!`);
      logger.error(message);
    }
  });
  return {
    pkgBuildStatusList: result,
    pkgBuildStatusMap: resultMap,
  };
};
