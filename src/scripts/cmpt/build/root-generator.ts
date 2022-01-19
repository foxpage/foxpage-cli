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
import { PackageDataType, PackageHashMap, PackagesDataType } from './typing';
import { Constants, FolderHashOptions } from './constants';
import { getUniqueColorChalk } from '../../../utils/chalk-color';
import { getFoxpageData } from './utils';

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
export const generatePackageHashMap = async ({
  output,
  cacheFilePath,
  clean,
  packagesPath = [],
  concurrency,
}: {
  output: string;
  cacheFilePath: string;
  clean: boolean;
  packagesPath: string[];
  concurrency: number;
}): Promise<PackageHashMap> => {
  let packagesHashMap: PackageHashMap = {};
  const packageDirNames = packagesPath.map((packagePath: string) => basename(packagePath));
  if (await fs.pathExists(cacheFilePath)) {
    await fs
      .readJson(cacheFilePath)
      .then((json = {}) => (packagesHashMap = json))
      .catch(err => {
        logger.error(`Read '${cacheFilePath}' error!`);
        console.error(err);
      });
    // Make sure the packagesHashMap is correct!
    await pMap(
      Object.keys(packagesHashMap),
      async (key: string) => {
        // delete invalid key
        if (!packageDirNames.includes(key)) {
          delete packagesHashMap[key];
          return;
        }
        // parse and valid '${output}/${outputCompDirName}/<package>' is exist and no empty, otherwise delete the hash of package
        const cachePackagePath = join(output, `${Constants.outputCompDirName}/${key}`);
        const isOutCache =
          (
            await fs.readdir(cachePackagePath).catch(() => {
              return [];
            })
          ).length === 0;
        if (isOutCache) {
          delete packagesHashMap[key];
          return;
        }
      },
      {
        concurrency,
      },
    );
  }
  if (clean) {
    const outputPackageDirNames = await globby(`${Constants.outputCompDirName}/*`, {
      cwd: output,
      onlyDirectories: true,
    }).then((dirs: string[]) => {
      return dirs.map((dir: string) => basename(dir));
    });
    // delete invalid "component/<package>" of "root/dist";
    await pMap(
      outputPackageDirNames,
      async (name: string) => {
        if (!packageDirNames.includes(name)) {
          fs.remove(join(output, `${Constants.outputCompDirName}/${name}`));
        }
      },
      {
        concurrency,
      },
    );
  }
  return packagesHashMap;
};

export const generatePackagesData = async ({
  useCache,
  packagesPath = [],
  packagesHashMap = {},
  concurrency,
}: {
  useCache: boolean;
  packagesPath: string[];
  packagesHashMap: PackageHashMap;
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
            useCache: useCache && packagesHashMap[name] === contentHash,
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

export const generatePackagesResource = async ({
  npmClient,
  commandKeyword,
  packagesData = [],
  concurrency,
}: {
  npmClient: string;
  commandKeyword: string;
  packagesData: PackageDataType[];
  concurrency: number;
}) => {
  const result = await pMap(
    packagesData,
    async (pkg: PackageDataType, index: number) => {
      const { name, packagePath } = pkg;
      const colorName = getUniqueColorChalk(name);
      try {
        const command = `${npmClient} run build:${commandKeyword}`;
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
  logger.colorMsg('grey', `------[build results]:------`);
  result.forEach(item => {
    const { isSuc, name, colorName, message } = item;
    resultMap[name] = isSuc;
    if (isSuc) {
      logger.success(`FoxpageBuild ${colorName} succeed!`);
    } else {
      logger.error(`FoxpageBuild ${colorName} fail: `);
      logger.error(message);
      logger.error(`FoxpageBuild ${colorName} fail message end!`);
    }
  });
  logger.colorMsg('grey', `------[build results end]------`);
  return {
    pkgBuildStatusList: result,
    pkgBuildStatusMap: resultMap,
  };
};

// generate foxpages.json
export const generateFoxpagesJson = async ({ context, output }: { context: string; output: string }) => {
  const packageJsonPaths = await globby(`${Constants.outputCompDirName}/*/foxpage.json`, {
    cwd: output,
    absolute: true,
  });
  const rootFoxpageInfo = await fs
    .readJSON(join(context, 'package.json'))
    .then(pkg => pkg.foxpage || {})
    .catch(() => ({}));
  const foxpagesJson = {
    ...rootFoxpageInfo,
    packages: [],
  };
  packageJsonPaths.forEach((foxpageJsonPath: string) => {
    try {
      const foxpageJson = fs.readJSONSync(foxpageJsonPath);
      if (foxpageJson) {
        foxpagesJson.packages.push(foxpageJson);
      } else {
        logger.error(`Can't find the "${foxpageJsonPath}"`);
      }
    } catch (e) {
      logger.error(`Can't get foxpage into from "${foxpageJsonPath}" file.`);
      console.error(e);
    }
  });
  await fs
    .writeJson(`${output}/foxpages.json`, foxpagesJson)
    .then(() => {
      logger.success('generate foxpages.json');
    })
    .catch(err => {
      logger.error('generate foxpages.json');
      console.error(err);
    });
};
