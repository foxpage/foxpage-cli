declare module 'less-plugin-npm-import' {
  import Less from 'less';
  export default class LessPluginNpmImport {
    private options: any;
    constructor(option: any);
    install(less: Less, pluginManager: Less.PluginManager): void;
    printUsage(): void;
    setOptions(options: any): void;
  }
}
