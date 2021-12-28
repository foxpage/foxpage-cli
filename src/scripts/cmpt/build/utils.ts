import fs from 'fs-extra';
import { join, basename } from 'path';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageJson } from './typing';

export const getPackageJsonPath = (packagePath: string) => {
  if (!packagePath) {
    logger.error('packagePath is empty!');
    return '';
  }
  return join(packagePath, 'package.json');
};

export const getFoxpageData = async (context: string = process.cwd()): Promise<FoxpageJson> => {
  const dirName = basename(context);
  const packageDataPath = getPackageJsonPath(context);
  try {
    const { name, version, private: isPrivate = false, foxpage = {} } = fs.readJsonSync(packageDataPath);
    return {
      name,
      version,
      isPrivate,
      foxpage: {
        name,
        version,
        ...foxpage,
        // force cover
        dirName,
        schema: {},
      },
    };
  } catch (e) {
    logger.error('Generate foxpageData fail!\n', e);
    process.exit(1);
  }
};
