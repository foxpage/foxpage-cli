import { FoxpagePackageNewOption } from './type.d';
import { newPackage } from './new-package';
import { selectTemplate } from './select-template';

const main = async (opt: FoxpagePackageNewOption) => {
  const { template, templates } = opt;
  if (template) {
    await newPackage(opt);
  } else if (templates) {
    const selectedTemplate = await selectTemplate(opt);
    opt.template = selectedTemplate;
    await newPackage(opt);
  }
};

export default main;
