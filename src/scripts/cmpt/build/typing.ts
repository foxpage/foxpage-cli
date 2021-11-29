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
  fileHash?: boolean;
  progressPlugin?: boolean;
  analyze?: boolean;
  minimize?: boolean;
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
    publicPath?: string;
    ignore?: boolean;
    disableContainer?: boolean;
  };
}

export interface FoxpageBuildCompileOption extends FoxpageBuildOption {
  foxpageData: FoxpageJson;
}
