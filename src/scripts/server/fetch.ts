import open from 'open';
import execa from 'execa';
import path from 'path';
import pMap from 'p-map';
import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import * as InquirerHelper from '../../utils/inquirer-helper';
import { REPOS } from '../../constants/serverConst';
import Config from '../../constants/config';
import fetchRepo from '../../utils/fetch-repo';

async function initProject(name = 'foxpage') {
  await mkRootDir(name);
  await fetchProject(name);
  await afterFetch(name);
}

async function mkRootDir(name: string) {
  await fs.mkdir(name);
}

async function fetchProject(name: string) {
  const option = {
    cwd: path.join(process.cwd(), name),
  };
  await pMap(REPOS, repo => fetchRepo(repo, option));
}

async function afterFetch(name: string) {
  // show config
  logger.colorLog('green', `View documentation: ${Config.configHelpUri}`);
  const isOpenDoc = await InquirerHelper.confirm('Go to doc immediately? (default: false)', false);
  if (isOpenDoc) await open(Config.configHelpUri);
  // check if need install
  const isNeedInstall = await InquirerHelper.confirm('Automatically install dependencies? (default: false)', false);
  if (isNeedInstall) {
    await execa.command(`foxpage server install`, {
      stdio: 'inherit',
      cwd: path.join(process.cwd(), name),
    });
  } else {
    logger.colorLog('green', `Run "cd ${name} && foxpage server install" to install dependencies by yourself.`);
  }
}

export default initProject;
