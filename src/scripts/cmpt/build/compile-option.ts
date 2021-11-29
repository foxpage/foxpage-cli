import { FoxpageBuildCompileOption, FoxpageBuildOption } from './typing';
import { logger } from '@foxpage/foxpage-component-shared';
import obPath from 'object-path';

import { getFoxpageData } from './utils';
import { checkRequired, checkNoUndefined, checkVersionValid } from '../../../utils/validator';

const validList = [
  {
    path: 'foxpageData',
    validator: checkNoUndefined,
    errInfo: '[foxpage.json] Error: foxpage.json is empty!',
  },
  {
    path: 'foxpageData.name',
    validator: checkRequired,
    errInfo: '[foxpage.json] Error: name is undefined!',
  },
  // 无需 group
  // {
  //   path: "foxpageData.group",
  //   validator: checkRequired,
  //   errInfo: "[foxpage.json] Error: group is undefined!",
  // },
  {
    path: 'foxpageData.version',
    validator: checkVersionValid,
    errInfo: '[foxpage.json] Error: version is undefined or not valid!',
  },
];

const validCompileOption = (option: FoxpageBuildCompileOption) => {
  logger.info('[foxpage cli]: valid options...');
  const errs: string[] = [];
  validList.forEach(item => {
    const { path, validator, errInfo } = item;
    const value = obPath.get(option || {}, path);
    const isValid = validator(value);
    if (!isValid) {
      errs.push(errInfo);
    }
  });
  if (errs && errs.length > 0) {
    errs.forEach(info => logger.error(info));
    process.exit();
  }
  logger.success('[foxpage cli]: valid options success...');
};

export const getCompileOption = async (option: FoxpageBuildOption) => {
  const { context } = option;
  const foxpageData = await getFoxpageData(context);
  const compileOption: FoxpageBuildCompileOption = {
    ...option,
    foxpageData,
  };
  validCompileOption(compileOption);
  return compileOption;
};
