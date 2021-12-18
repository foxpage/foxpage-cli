import { BuildFoxpageMode } from '@foxpage/foxpage-component-webpack';

export interface FoxpageBuildOption {
  // main process
  foxpageRoot?: boolean;
  foxpage?: boolean;
  lib?: boolean;
  esModule?: boolean;
  schemaMd?: boolean;
  // common
  context: string;
  clean?: boolean;
  assetsHash?: boolean;
  debug?: boolean;
  // used for foxpage-root
  rootCache: boolean;
  npmClient: string;
  maxConcurrency: number;
  concurrency: number;
  // used for foxpage
  modes: BuildFoxpageMode[];
  manifest?: boolean;
  fileHash?: boolean;
  progressPlugin?: boolean;
  analyze?: boolean;
  minimize?: boolean;
  generateFoxpageJson?: boolean;
  zipFox?: boolean;
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
