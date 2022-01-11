export interface RepoEntryType {
  name: string;
  entryPath?: string;
  install?: string[];
}
export interface RepoInfo {
  name: string;
  uri: string;
  zipUri?: string;
  zipEntryPath?: string;
  repoEntries?: RepoEntryType[];
}
export const REPOS: RepoInfo[] = [
  {
    name: 'foxpage',
    uri: 'https://github.com/foxpage/foxpage.git',
    zipUri: 'https://github.com/foxpage/foxpage/archive/main.zip',
    zipEntryPath: 'foxpage-main',
    repoEntries: [
      {
        name: 'foxpage-server',
        entryPath: 'packages/foxpage-server',
        install: ['yarn'],
      },
      {
        name: 'foxpage-admin',
        entryPath: 'packages/foxpage-admin',
        install: ['yarn'],
      },
    ],
  },
  {
    name: 'foxpage-app-server',
    uri: 'https://github.com/foxpage/foxpage-sdk-js.git',
    zipUri: 'https://github.com/foxpage/foxpage-sdk-js/archive/main.zip',
    zipEntryPath: 'foxpage-sdk-js-main',
    repoEntries: [
      {
        name: 'foxpage-app-server',
        entryPath: 'packages/foxpage-app-server',
        install: ['yarn'],
      },
    ],
  },
];
