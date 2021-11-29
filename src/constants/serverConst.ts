export interface RepoInfo {
  name: string;
  uri: string;
  repoEntryPath?: string;
  zipUri?: string;
  zipEntryPath?: string;
  install?: string[];
}
export const REPOS: RepoInfo[] = [
  {
    name: 'foxpage-app-server',
    uri: 'https://github.com/foxfamily/foxpage-sdk-js.git',
    repoEntryPath: 'packages/foxpage-app-server',
    zipUri: 'https://github.com/foxfamily/foxpage-sdk-js/archive/main.zip',
    zipEntryPath: 'foxpage-sdk-js-main',
    install: ['yarn'],
  },
  {
    name: 'foxpage-server',
    uri: 'https://github.com/foxfamily/foxpage-server.git',
    repoEntryPath: 'packages/foxpage-server',
    zipUri: 'https://github.com/foxfamily/foxpage-server/archive/main.zip',
    zipEntryPath: 'foxpage-server-main',
    install: ['yarn'],
  },
  {
    name: 'foxpage-admin',
    uri: 'https://github.com/foxfamily/foxpage-admin.git',
    repoEntryPath: 'packages/foxpage-admin',
    zipUri: 'https://github.com/foxfamily/foxpage-admin/archive/main.zip',
    zipEntryPath: 'foxpage-admin-main',
    install: ['yarn'],
  },
];
