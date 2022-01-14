import { BuildMode } from '@foxpage/foxpage-component-webpack';

export type BuildType = 'foxpageRoot' | 'foxpage' | 'umd' | 'cjs' | 'lib' | 'esModule' | 'schemaMd' | 'none';
export interface FoxpageBuildOption {
  // main process
  foxpageRoot?: boolean;
  foxpage?: boolean;
  umd?: boolean;
  cjs?: boolean;
  lib?: boolean;
  esModule?: boolean;
  schemaMd?: boolean;
  // common
  context: string;
  output: string;
  buildType: BuildType;
  clean?: boolean;
  assetsHash?: boolean;
  debug?: boolean;
  // used for foxpage-root
  rootCache: boolean;
  npmClient: string;
  maxConcurrency: number;
  concurrency: number;
  // used for foxpage, umd, cjs
  modes: BuildMode[];
  manifest?: boolean;
  fileHash?: boolean;
  progressPlugin?: boolean;
  analyze?: boolean;
  cssInJs?: boolean;
  // used for only foxpage
  generateFoxpageJson?: boolean;
  zipFox?: boolean;
  zipFoxOutput?: string;
  // used for lib es
  babelOptions?: string;
  tsDeclaration?: boolean;
  cssStyle?: boolean;
  removeStyleImport?: boolean;
  importIndexCss?: boolean;
}

export interface FoxpageJson {
  name: string;
  version: string;
  isPrivate?: boolean;
  foxpage: {
    name?: string;
    version?: string;
    // comp, editor
    type?: string;
    dirName?: string;
    publicPath?: string;
    schema?: Record<string, any>;
    meta?: Record<string, any>;
    ignore?: boolean;
    disableContainer?: boolean;
    dependencies?: (string | Record<string, any>)[];
    editors?: (string | Record<string, any>)[];
  };
}

export interface FoxpageBuildCompileOption extends FoxpageBuildOption {
  foxpageData: FoxpageJson;
}
