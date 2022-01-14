import { BuildType } from './typing';
export const Constants = {
  defaultFoxpageRootOutput: 'dist',
  defaultFoxpageOutput: 'dist',
  defaultUmdOutput: 'umd',
  defaultCjsOutput: 'cjs',
  defaultLibOutput: 'lib',
  defaultEsOutput: 'es',
  defaultSchemaMdOutput: '',
  defaultZipFoxOutputSuffix: '-zip',
  schemaMdFilename: 'schema.md',
  schemaJsonFilename: 'schema.json',
  foxpageJsonFilename: 'foxpage.json',
};

// force to set value of build type
export const BuildMap: Record<BuildType, BuildType> = {
  foxpageRoot: 'foxpageRoot',
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
  [BuildMap.foxpage]: Constants.defaultFoxpageOutput,
  [BuildMap.umd]: Constants.defaultUmdOutput,
  [BuildMap.cjs]: Constants.defaultCjsOutput,
  [BuildMap.lib]: Constants.defaultLibOutput,
  [BuildMap.esModule]: Constants.defaultEsOutput,
  [BuildMap.schemaMd]: Constants.defaultSchemaMdOutput,
  [BuildMap.none]: Constants.defaultFoxpageOutput,
};
