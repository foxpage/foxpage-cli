import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import buildFoxpage from './build-foxpage';
import buildLibEsModule from './build-lib-es';
import buildSchemaMd from './build-schema-md';
import buildFoxpageRoot from './build-foxpage-root';

const mainBuild = async (option: FoxpageBuildOption) => {
  try {
    logger.info('[foxpage cli]: component build');
    const { foxpageRoot, foxpage, lib, esModule, schemaMd } = option;
    option.context = process.cwd();
    if (foxpageRoot) {
      await buildFoxpageRoot(option);
    } else if (foxpage) {
      await buildFoxpage(option);
    } else if (lib || esModule) {
      await buildLibEsModule(option);
    } else if (schemaMd) {
      await buildSchemaMd(option);
    } else {
      logger.info('Unknown main process, treat as foxpage');
      await buildFoxpage(option);
    }
  } catch (e) {
    logger.error('foxpage build fail\n', e);
    process.exit(1);
  }
};

export default mainBuild;
