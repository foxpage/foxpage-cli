import { logger } from '@foxpage/foxpage-component-shared';
import path from 'path';
import { BuildType, FoxpageBuildOption } from './typing';
import buildFoxpage from './build-foxpage';
import buildUmd from './build-umd';
import buildCjs from './build-cjs';
import buildLibEsModule from './build-lib-es';
import buildSchemaMd from './build-schema-md';
import buildFoxpageRoot from './build-foxpage-root';
import buildUmdRoot from './build-umd-root';
import buildCjsRoot from './build-cjs-root';
import { BuildOutputMap, BuildMap } from './constants';

const MainBuildMap: Record<BuildType, ((arg0: FoxpageBuildOption) => Promise<void>) | undefined> = {
  foxpageRoot: buildFoxpageRoot,
  umdRoot: buildUmdRoot,
  cjsRoot: buildCjsRoot,
  foxpage: buildFoxpage,
  umd: buildUmd,
  cjs: buildCjs,
  lib: buildLibEsModule,
  esModule: buildLibEsModule,
  schemaMd: buildSchemaMd,
  none: undefined,
};

const mainBuild = async (option: FoxpageBuildOption) => {
  try {
    logger.info('[foxpage cli]: component build');
    await initOptions(option);
    const { buildType } = option;
    const builder = MainBuildMap[buildType];
    if (builder) {
      await builder(option);
    } else {
      logger.info('Unknown main process, treat as foxpage');
      await buildFoxpage(option);
    }
  } catch (e) {
    logger.error('foxpage build fail\n', e);
    process.exit(1);
  }
};

const initOptions = async (option: FoxpageBuildOption) => {
  // init buildType
  const { foxpageRoot, umdRoot, cjsRoot, foxpage, umd, cjs, lib, esModule, schemaMd, output } = option;
  if (foxpageRoot) {
    option.buildType = BuildMap['foxpageRoot'];
  } else if (umdRoot) {
    option.buildType = BuildMap['umdRoot'];
  } else if (cjsRoot) {
    option.buildType = BuildMap['cjsRoot'];
  } else if (foxpage) {
    option.buildType = BuildMap['foxpage'];
  } else if (umd) {
    option.buildType = BuildMap['umd'];
  } else if (cjs) {
    option.buildType = BuildMap['cjs'];
  } else if (lib) {
    option.buildType = BuildMap['lib'];
  } else if (esModule) {
    option.buildType = BuildMap['esModule'];
  } else if (schemaMd) {
    option.buildType = BuildMap['schemaMd'];
  } else {
    option.buildType = BuildMap['none'];
  }
  // init context
  option.context = process.cwd();
  // init output
  // init output: support relative path, transform to absolute path
  if (output && !path.isAbsolute(output)) {
    option.output = path.join(option.context, output);
  } else {
    option.output = path.join(option.context, BuildOutputMap[option.buildType]);
  }
};

export default mainBuild;
