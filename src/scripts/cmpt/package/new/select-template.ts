import { logger } from '@foxpage/foxpage-component-shared';
import fs from 'fs-extra';
import { FoxpagePackageNewOption } from './type.d';
import * as InquirerHelper from '../../../../utils/inquirer-helper';
import { join } from 'path';

export async function selectTemplate(opt: FoxpagePackageNewOption) {
  const { templates } = opt;

  if (!templates) {
    logger.error('miss templates directory');
    process.exit(0);
  }

  if (!fs.pathExistsSync(templates)) {
    logger.error('templates directory does not exist');
    process.exit(0);
  }

  const subFiles = await fs.readdir(templates, { withFileTypes: true });
  const tempDirs = subFiles.filter(file => file.isDirectory()).map(file => file.name);
  if (!tempDirs || tempDirs.length < 1) {
    logger.error('There are no template to choose from in the templates directory!!!');
    process.exit(0);
  }
  const selectedTemplate = await InquirerHelper.select(
    'Please select the template you want to create:',
    tempDirs,
    tempDirs[0],
    {
      validate: (input = '') => {
        if (!input) {
          return 'required';
        }
        return true;
      },
    },
  );
  return join(templates, selectedTemplate);
}
