import { join } from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import pMap from 'p-map';
import ora from 'ora';
import { logger } from '@foxpage/foxpage-component-shared';
import { REPOS } from '../../constants/serverConst';
import { oraSafeLog } from '../../utils/ora-helper';

interface InstallConfig {
  name: string;
  install: string[];
  cwd?: string;
  spinner?: ora.Ora;
}

const main = async () => {
  const spinner = ora();
  spinner.text = 'install dependencies...';
  spinner.start();
  const installList: InstallConfig[] = [];
  REPOS.forEach(repo => {
    const { repoEntries = [] } = repo;
    if (repoEntries?.length > 0) {
      repoEntries.forEach(repoEntry => {
        const { name, install } = repoEntry;
        if (name && install) {
          installList.push({
            name,
            install,
            spinner,
          });
        }
      });
    }
  });
  await pMap(installList, installDependency);
  spinner.succeed(`install dependencies done!`);
};

const installDependency = async (config: InstallConfig): Promise<boolean> => {
  const { name, install = [], cwd = join(process.cwd(), name), spinner } = config;
  if (!fs.pathExistsSync(cwd)) {
    oraSafeLog(spinner, () => {
      logger.error(`'${cwd}' don't exists. can't install`);
    });
    return false;
  }
  const modulesDir = join(cwd, 'node_modules');
  const isExist = await fs.pathExists(modulesDir);
  if (isExist) {
    oraSafeLog(spinner, () => {
      logger.warn(`${modulesDir} is already exists!!!`);
    });
    return true;
  }
  oraSafeLog(spinner, () => {
    logger.info(`"${name}" install dependencies...`);
  });
  let status = 0;
  await pMap(
    install,
    async cmd => {
      if (cmd && status === 0) {
        await execa.command(cmd, { stdio: 'pipe', cwd }).catch(error => {
          status = 1;
          return logger.error(error.message);
        });
      }
    },
    {
      concurrency: 1,
    },
  );

  if (status !== 0) {
    oraSafeLog(spinner, () => {
      logger.error(`"${name}" install dependencies failed!`);
    });
    return false;
  } else {
    oraSafeLog(spinner, () => {
      logger.success(`"${name}" install dependencies succeeded!`);
    });
    return true;
  }
};

main();
