export const FolderHashOptions = {
  folders: {
    exclude: ['.*', 'dist', 'es', 'lib', 'node_modules', 'stories', 'test'],
  },
  files: {
    exclude: ['.*', 'schema.md', 'README.md', '*.stories.+(tsx|jsx|ts|js)', '*.test.+(tsx|jsx|ts|js)'],
  },
};

export const Constants = {
  rootCacheFilePath: '.cache/foxpage/root-cache.json',
  rootDistPath: 'dist',
  rootDistComponentPath: `dist/component`,
  packagesPath: 'packages',
  lernaBuildCommander: 'lerna run build:foxpage --stream --no-bail',
};
