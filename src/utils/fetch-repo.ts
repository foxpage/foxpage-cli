/*
 * @Author: j.yangf
 * @Date: 2021-10-12 14:45:48
 * @LastEditors: j.yangf
 * @LastEditTime: 2021-11-17 16:45:08
 * @Description: fetch repository function
 */
import os from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import got from 'got';
import ora from 'ora';
import execa from 'execa';
import AdmZip from 'adm-zip';
import stream from 'stream';
import { promisify } from 'util';
import { logger } from '@foxpage/foxpage-component-shared';
import { commandExist } from './command-tool';
import { RepoInfo } from '../constants/serverConst';

const TMP_DIR = os.tmpdir();

interface Options {
  useOra?: boolean;
  cwd?: string;
}

const fetchRepo = async (repoInfo: RepoInfo, options: Options = {}): Promise<boolean> => {
  const { name, uri, repoEntryPath = '', zipUri, zipEntryPath = '' } = repoInfo;
  const { useOra, cwd = process.cwd() } = options;
  const spinner = useOra ? ora() : null;
  const loggerInfo = spinner ? (text: string) => spinner.start(text) : logger.info;
  const loggerSuccess = spinner ? (text: string) => spinner.succeed(text) : logger.success;
  const loggerError = spinner ? (text: string) => spinner.fail(text) : logger.error;
  try {
    const repoPath = join(cwd, name);
    const isExist = await fs.pathExists(repoPath);
    if (isExist) {
      logger.error(`${repoPath} is already exists!!!`);
      return false;
    }
    const hasGit = await commandExist('git');
    const tempRepoFolderName = `${name}.${new Date().getTime()}`;
    const tempRepoFolderPath = join(TMP_DIR, tempRepoFolderName);
    if (hasGit && uri) {
      loggerInfo(`[git]: getting '${uri}' ...`);
      const status = await execa
        .command(`git clone ${uri} --depth=1 ${tempRepoFolderName}`, {
          cwd: TMP_DIR,
          stdio: 'pipe',
        })
        .then(() => 0)
        .catch(error => {
          loggerError(`[git]: get '${uri}' fail!`);
          logger.error(error.message);
        });
      if (status === 0) {
        // remove .git
        await fs.remove(`${tempRepoFolderPath}/.git`);
        const src = join(tempRepoFolderPath, repoEntryPath || '');
        await fs.move(src, repoPath);
        await fs.remove(tempRepoFolderPath);
        loggerSuccess(`[git]: get '${name}' success!`);
        return true;
      }
    }
    if (zipUri) {
      loggerInfo(`[download]: getting '${zipUri}' ...`);
      const repoZipPath = `${tempRepoFolderPath}.zip`;
      const file = fs.createWriteStream(repoZipPath);
      const pipeline = promisify(stream.pipeline);
      const status = await pipeline(got.stream(zipUri), file)
        .then(() => 0)
        .catch(error => {
          loggerError(`[download]: get '${zipUri}' fail!`);
          logger.error(error);
        });

      if (status === 0) {
        loggerInfo(`download '${name}' done.`);
        if (!fs.pathExistsSync(repoZipPath)) {
          throw new Error(`'${repoZipPath}' don't exist!`);
        }
        const repoZip = new AdmZip(repoZipPath);
        repoZip.extractAllTo(tempRepoFolderPath);
        if (zipEntryPath && fs.pathExistsSync(join(tempRepoFolderPath, zipEntryPath))) {
          await fs.move(join(tempRepoFolderPath, zipEntryPath, repoEntryPath), repoPath);
          await fs.remove(tempRepoFolderPath);
        } else {
          await fs.move(tempRepoFolderPath, repoPath);
        }
        loggerInfo(`unzip ${name} done.`);

        await fs.remove(repoZipPath);
        loggerSuccess(`[download]: get '${name}' success!`);

        return true;
      }
    }
    if (!spinner) {
      logger.error(`there is no other way to get ${name}!`);
    }
    return false;
  } catch (e) {
    if (spinner && spinner.isSpinning) {
      spinner.fail();
    }
    logger.error(e.message);
    return false;
  }
};

export default fetchRepo;
