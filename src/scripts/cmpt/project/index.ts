import execa from 'execa';
import fs from 'fs-extra';
import { join } from 'path';
import Config from '../../../constants/config';
import fetchRepo from '../../../utils/fetch-repo';
import * as InquirerHelper from '../../../utils/inquirer-helper';

const main = async (name: string) => {
  const CWD = process.cwd();
  // check if need use 'foxpage-component-' prefix
  const isUsePrefix = await InquirerHelper.confirm("Does name use the 'foxpage-component' prefix?");
  const projectName = `${isUsePrefix ? 'foxpage-component-' : ''}${name}`;
  const projectPath = join(CWD, projectName);
  // project is already exist
  if (fs.pathExistsSync(projectPath)) {
    console.error(`${projectName} is exists!`);
    process.exit(1);
  }

  await fetchRepo(
    {
      name: projectName,
      uri: Config.boilerplateUrl,
      zipUri: Config.boilerplateZipUrl,
    },
    { useOra: true },
  );

  // edit package.json file, update name to projectName
  const pkgJsonPath = join(CWD, projectName, 'package.json');
  if (fs.pathExistsSync(pkgJsonPath)) {
    const pkgJsonStr = await fs.readFile(pkgJsonPath, 'utf8');
    const newPkgJsonStr = pkgJsonStr.replace('foxpage-component-boilerplate', projectName);
    if (newPkgJsonStr !== pkgJsonStr) {
      await fs.writeFile(pkgJsonPath, newPkgJsonStr);
    }
  }

  // if need install dependencies
  if (fs.pathExistsSync(projectPath)) {
    const isNeedInstall = await InquirerHelper.confirm(`Auto install for "${projectName}"?`);
    if (isNeedInstall) {
      await execa.command('yarn boot', {
        cwd: join(CWD, projectName),
        stdio: 'inherit',
      });
    }
  }
};

export default main;
