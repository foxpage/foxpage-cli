import os from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import got from 'got';
import ora from 'ora';
import execa from 'execa';
import AdmZip from 'adm-zip';
import stream from 'stream';
import { promisify } from 'util';
import pMap from 'p-map';
import { logger } from '@foxpage/foxpage-component-shared';
import { commandExist } from './command-tool';
import { RepoInfo } from '../constants/serverConst';

const TMP_DIR = os.tmpdir();

interface Options {
  useOra?: boolean;
  cwd?: string;
}

const fetchRepo = async (repoInfo: RepoInfo, options: Options = {}): Promise<boolean> => {
  let res = true;
  const { name, uri, repoEntries = [], zipUri, zipEntryPath = '' } = repoInfo;
  const { useOra, cwd = process.cwd() } = options;
  const spinner = useOra ? ora() : null;
  const loggerInfo = spinner ? (text: string) => spinner.start(text) : logger.info;
  const loggerSuccess = spinner ? (text: string) => spinner.succeed(text) : logger.success;
  const loggerError = spinner ? (text: string) => spinner.fail(text) : logger.error;
  try {
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
        if (repoEntries.length > 0) {
          await pMap(repoEntries, async repoEntry => {
            const { name, entryPath = '' } = repoEntry;
            if (name) {
              if (await safeMove(join(tempRepoFolderPath, entryPath), join(cwd, name))) {
                loggerSuccess(`[git]: get '${name}' success!`);
              } else {
                res = false;
              }
            }
          });
        } else {
          if (await safeMove(tempRepoFolderPath, join(cwd, name))) {
            loggerSuccess(`[git]: get '${name}' success!`);
          } else {
            res = false;
          }
        }
        await fs.remove(tempRepoFolderPath);
        return res;
      }
    }
    if (zipUri) {
      loggerInfo(`[zip]: getting '${zipUri}' ...`);
      const repoZipPath = `${tempRepoFolderPath}.zip`;
      const file = fs.createWriteStream(repoZipPath);
      const pipeline = promisify(stream.pipeline);
      const status = await pipeline(got.stream(zipUri), file)
        .then(() => 0)
        .catch(error => {
          loggerError(`[zip]: get '${zipUri}' fail!`);
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
          if (repoEntries.length > 0) {
            await pMap(repoEntries, async repoEntry => {
              const { name, entryPath = '' } = repoEntry;
              if (name) {
                if (await safeMove(join(tempRepoFolderPath, zipEntryPath, entryPath), join(cwd, name))) {
                  loggerSuccess(`[zip]: get '${name}' success!`);
                } else {
                  res = false;
                }
              }
            });
          } else {
            if (await safeMove(join(tempRepoFolderPath, zipEntryPath), join(cwd, name))) {
              loggerSuccess(`[zip]: get '${name}' success!`);
            } else {
              res = false;
            }
          }
          await fs.remove(tempRepoFolderPath);
        } else {
          if (await safeMove(tempRepoFolderPath, join(cwd, name))) {
            loggerSuccess(`[zip]: get '${name}' success!`);
          } else {
            res = false;
          }
        }
        await fs.remove(repoZipPath);
        return res;
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

const safeMove = async (from: string, to: string): Promise<boolean> => {
  const isExist = await fs.pathExists(to);
  if (isExist) {
    logger.error(`${to} is already exists!!!`);
    return false;
  } else {
    await fs.move(from, to);
  }
  return true;
};

export default fetchRepo;
