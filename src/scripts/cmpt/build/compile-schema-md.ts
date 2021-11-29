import { outputFile } from 'fs-extra';
import { logger } from '@foxpage/foxpage-component-shared';
import { JSONSchemaMarkdown } from '../../../plugins/json-schema-md';

interface WriteSchemaMdType {
  schema: any;
  name?: string;
  output: string;
}

async function writeSchemaMd({ schema, name, output }: WriteSchemaMdType): Promise<{ status: boolean }> {
  if (!output || output.indexOf('.md') < 0) {
    logger.warn(`Can't handle the error output (${output})`);
    return {
      status: false,
    };
  }
  const SchemaMD = new JSONSchemaMarkdown({
    name,
    isShowPaths: false,
    footer: '',
  });
  SchemaMD.load(schema);
  SchemaMD.generate();
  if (SchemaMD.errors.length > 0) {
    console.error('[build md with schema error]: ', SchemaMD.errors);
    return {
      status: false,
    };
  } else {
    await new Promise<void>(res => {
      outputFile(output, SchemaMD.markdown, err => {
        if (err) console.error(err);
        res();
      });
    });
  }
  return {
    status: true,
  };
}

export default writeSchemaMd;
