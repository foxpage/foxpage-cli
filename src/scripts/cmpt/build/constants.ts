import { BuildType } from './typing';
export const Constants = {
  defaultFoxpageRootOutput: 'dist',
  defaultFoxpageOutput: 'dist',
  defaultUmdRootOutput: 'umd',
  defaultUmdOutput: 'umd',
  defaultCjsRootOutput: 'cjs',
  defaultCjsOutput: 'cjs',
  defaultLibOutput: 'lib',
  defaultEsOutput: 'es',
  defaultSchemaMdOutput: '',
  defaultZipFoxOutputSuffix: '-zip',
  schemaMdFilename: 'schema.md',
  schemaJsonFilename: 'schema.json',
  foxpageJsonFilename: 'foxpage.json',
  rootFoxpageCacheFilePath: '.cache/foxpage/foxpage-cache.json',
  rootUmdCacheFilePath: '.cache/foxpage/umd-cache.json',
  rootCjsCacheFilePath: '.cache/foxpage/cjs-cache.json',
  packagesPath: 'packages',
  outputCompDirName: 'component',
};

// force to set value of build type
export const BuildMap: Record<BuildType, BuildType> = {
  foxpageRoot: 'foxpageRoot',
  umdRoot: 'umdRoot',
  cjsRoot: 'cjsRoot',
  foxpage: 'foxpage',
  umd: 'umd',
  cjs: 'cjs',
  lib: 'lib',
  esModule: 'esModule',
  schemaMd: 'schemaMd',
  none: 'none',
};

export const BuildOutputMap = {
  [BuildMap.foxpageRoot]: Constants.defaultFoxpageRootOutput,
  [BuildMap.umdRoot]: Constants.defaultUmdRootOutput,
  [BuildMap.cjsRoot]: Constants.defaultCjsRootOutput,
  [BuildMap.foxpage]: Constants.defaultFoxpageOutput,
  [BuildMap.umd]: Constants.defaultUmdOutput,
  [BuildMap.cjs]: Constants.defaultCjsOutput,
  [BuildMap.lib]: Constants.defaultLibOutput,
  [BuildMap.esModule]: Constants.defaultEsOutput,
  [BuildMap.schemaMd]: Constants.defaultSchemaMdOutput,
  [BuildMap.none]: Constants.defaultFoxpageOutput,
};

export const FolderHashOptions = {
  folders: {
    exclude: ['.*', 'dist', 'es', 'lib', 'node_modules', 'stories', 'test'],
  },
  files: {
    exclude: ['.*', 'schema.md', 'README.md', '*.stories.+(tsx|jsx|ts|js)', '*.test.+(tsx|jsx|ts|js)'],
  },
};
