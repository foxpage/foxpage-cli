import fs from 'fs-extra';
import { join } from 'path';
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
  const packageDataPath = getPackageJsonPath(context);
  const foxpageDataPath = join(context, '.foxpage/foxpage.json');
  try {
    const { name, version, private: isPrivate = false, foxpage = {} } = fs.readJsonSync(packageDataPath);
    let foxpageJson = {};
    if (fs.existsSync(foxpageDataPath)) {
      foxpageJson = await fs.readJson(foxpageDataPath).catch(e => {
        logger.error(`Read "${foxpageDataPath}" error:\n`, e);
        return {};
      });
    }
    return {
      name,
      version,
      isPrivate,
      foxpage: {
        ...foxpage,
        ...foxpageJson,
      },
    };
  } catch (e) {
    logger.error('Generate foxpageData fail!\n', e);
    process.exit(1);
  }
};
