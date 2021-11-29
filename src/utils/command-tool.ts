/*
 * @Author: j.yangf
 * @Date: 2021-10-11 14:54:51
 * @LastEditors: j.yangf
 * @LastEditTime: 2021-10-12 14:48:17
 * @Description: command tool function
 */

import execa from 'execa';

const IS_WIN = process.platform === 'win32';
export async function commandExist(cmd: string) {
  cmd = IS_WIN ? `where ${cmd}` : `type ${cmd}`;
  const stdio = await execa.command(cmd, { stdio: 'pipe' }).catch(e => ({
    stderr: e.toString(),
  }));
  return !stdio.stderr;
}
