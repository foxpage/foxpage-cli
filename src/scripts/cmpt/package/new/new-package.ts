import { logger, caseStyle, resolveRoot, toAbsolutePath, paths } from '@foxpage/foxpage-component-shared';
import chalk from 'chalk';
import { FoxpagePackageNewOption } from './type';
import * as InquirerHelper from '../../../../utils/inquirer-helper';
import { createFromTemplate } from './template';

export async function newPackage(opt: FoxpagePackageNewOption) {
  const { template } = opt;

  if (!template) {
    logger.error('miss template directory');
    return;
  }

  const Name = await InquirerHelper.quiz('Please input new package name: (split by "-")', '', {
    validate: (input = '') => {
      if (!input) {
        return 'required';
      }
      return true;
    },
  });
  const ComponentName = caseStyle(Name);
  const variables = {
    Name,
    ComponentName,
  };
  logger.info(`name is: ${chalk.yellowBright(Name)}`);
  logger.info(`component name is: ${chalk.yellowBright(ComponentName)}`);
  logger.debug('template variables: %j', variables);
  await createFromTemplate(toAbsolutePath(template, paths.root), resolveRoot(`packages/${Name}`), variables, opt);
  logger.success('success create package: "%s"', Name);
}
