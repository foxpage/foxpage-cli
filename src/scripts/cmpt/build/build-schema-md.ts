import { join } from 'path';
import fs from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { FoxpageBuildOption } from './typing';
import { generateSchemaJson } from './compile-schema';
import { getCompileOption } from './compile-option';
import writeSchemaMd from './compile-schema-md';

const buildSchemaMd = async (option: FoxpageBuildOption) => {
  const { context, clean, debug } = option;
  logger.info('[foxpage cli]: build schema.md');
  if (clean) {
    fs.removeSync(join(context, 'schema.md'));
  }
  const compileOption = await getCompileOption(option);

  const tempFilePath = debug ? join(context, '.fox_temp', 'schema.temp.json') : undefined;

  const schema = await generateSchemaJson({
    context,
    name: compileOption.foxpageData.name,
    output: tempFilePath,
  });

  const { status } = await writeSchemaMd({
    schema,
    output: join(context, 'schema.md'),
    name: 'Component',
  });

  if (status) {
    logger.success('[foxpage cli]: build schema.md success...');
  } else {
    logger.error('[foxpage cli]: build schema.md fail...');
    process.exit(1);
  }
};

export default buildSchemaMd;
