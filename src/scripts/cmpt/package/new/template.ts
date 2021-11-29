import fs from 'fs-extra';
import globby from 'globby';
import execa from 'execa';
import { logger, existModule, readPackageInfo, paths } from '@foxpage/foxpage-component-shared';

export interface CreateFromTemplateOptions {
  force?: boolean;
  eol?: string;
  formate?: boolean;
}

async function formateCode(directory: string) {
  const scripts = readPackageInfo(paths.root, 'scripts');
  if (!scripts) {
    return;
  }
  const lintFixScript = Object.keys(scripts).find(s => s.includes('lint') && s.includes('fix'));
  if (lintFixScript) {
    try {
      const cmd = `npm run ${lintFixScript}`;
      await execa.command(cmd);
      logger.success(`run "${cmd}"`);
      return;
    } catch (error) {}
  }
  if ('lint' in scripts) {
    try {
      const cmd = `npm run lint -- --fix`;
      await execa.command(cmd);
      logger.success(`run "${cmd}"`);
      return;
    } catch (error) {}
  }
  if (existModule('eslint')) {
    try {
      const cmd = `npx eslint --ext .ts,.tsx,.js,.jsx --fix ${directory}`;
      await execa.command(cmd);
      logger.success(`run "${cmd}"`);
    } catch (error) {}
  }
}

const createReplacer = (reg: RegExp, variables: Record<string, string>) => (content: string) => {
  return content.replace(reg, (_matches, varName: string) => {
    return variables[varName] ?? varName;
  });
};

function replace(content: string, variables: Record<string, string>) {
  const regList = [/@(\w+)@/g, /___(\w+)___/g];

  let replaced = content;
  for (const reg of regList) {
    replaced = createReplacer(reg, variables)(replaced);
  }

  return replaced;
}

function filterContent(str = '') {
  const reg = /\/\* foxpage-template-ignore-start \*\/[\s\S]+\/\* foxpage-template-ignore-end \*\/\n/g;
  return str.replace(reg, '');
}

const createFileHandler =
  (variables: Record<string, string>, { eol = '\n' } = {}) =>
  async (filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      const content = filterContent(await fs.readFile(filePath, 'utf-8'));
      const lines = content.split(/\r?\n/);
      const usedContent = lines.join(eol);
      const replaced = replace(usedContent, variables);
      await fs.writeFile(filePath, replaced, { encoding: 'utf-8', flag: 'w' });
    } catch (error) {
      const msg = (error as Error)?.message || '';

      if (msg.includes('ENOENT')) {
        logger.warn("ignore copy file: %s because can' access file", filePath);
        return;
      }

      logger.error('handle file: %s fail, error:', filePath, msg);
      throw error;
    }
  };

async function cleanEmptyDirs(root: string) {
  const dirs = await globby('**/*', {
    cwd: root,
    onlyDirectories: true,
    absolute: true,
  });
  const handle = async (dir: string) => {
    try {
      // remove empty dir
      await fs.rmdir(dir);
    } catch (error) {}
  };
  await Promise.all(dirs.map(handle));
}

export async function createFromTemplate(
  source: string,
  target: string,
  variables: Record<string, any>,
  opt: CreateFromTemplateOptions,
) {
  const { formate = false } = opt;
  if (fs.existsSync(target)) {
    logger.error('destination directory "%s" exists.', target);
    return;
  }
  await fs.copy(source, target);
  try {
    const files = await globby('**/*.{js,jsx,ts,tsx,scss,css,less,sass,json,md}', {
      cwd: target,
      absolute: true,
      onlyFiles: true,
    });
    logger.debug('find files: %j', files);
    const handleFile = createFileHandler(variables, opt);
    await Promise.all(files.map(handleFile));
  } catch (error) {
    fs.removeSync(target);
    throw error;
  }
  await cleanEmptyDirs(target);
  if (formate) {
    await formateCode(target);
  }
}
