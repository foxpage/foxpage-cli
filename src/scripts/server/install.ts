import { join } from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import pMap from 'p-map';
import { logger } from '@foxpage/foxpage-component-shared';
import { REPOS, RepoInfo } from '../../constants/serverConst';

const CWD = process.cwd();

const main = async () => {
  await pMap(REPOS, installDependency);
};

const installDependency = async (repoInfo: RepoInfo): Promise<boolean> => {
  const { name, install = [] } = repoInfo;
  const projectDir = join(CWD, name);
  if (!fs.pathExistsSync(projectDir)) {
    logger.error(`'${projectDir}' don't exists. can't install`);
    return false;
  }
  const modulesDir = join(projectDir, 'node_modules');
  const isExist = await fs.pathExists(modulesDir);
  if (isExist) {
    logger.error(`${modulesDir} is already exists!!!`);
    return false;
  }
  logger.info(`${name} 依赖安装中...`);
  let status = 0;
  await pMap(
    install,
    async cmd => {
      if (cmd && status === 0) {
        await execa.command(cmd, { stdio: 'pipe', cwd: projectDir }).catch(error => {
          status = 1;
          return logger.error(error.message);
        });
      }
    },
    {
      // 按顺序执行
      concurrency: 1,
    },
  );

  if (status !== 0) {
    logger.error(`${name} 依赖安装失败!`);
    return false;
  } else {
    logger.success(`${name} 依赖安装成功!`);
    return true;
  }
};

main();
