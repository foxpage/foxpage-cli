import execa from 'execa';

const IS_WIN = process.platform === 'win32';

export function isWin() {
  return process.platform === 'win32';
}
export async function commandExist(cmd: string) {
  cmd = IS_WIN ? `where ${cmd}` : `type ${cmd}`;
  const stdio = await execa.command(cmd, { stdio: 'pipe' }).catch(e => ({
    stderr: e.toString(),
  }));
  return !stdio.stderr;
}
