import {
  paths,
  findPath,
  loadFile,
  findProjectFilePath,
  logger,
  caseStyle,
  wrapPromise,
  promiseTimeout,
} from '@foxpage/foxpage-component-shared';
import * as TJS from 'typescript-json-schema';
import { outputJSON } from 'fs-extra';
import { JsonSchemaGenerator } from 'typescript-json-schema';

export async function generateSchemaJson({
  context,
  name,
  output,
}: {
  context: string;
  name: string;
  output?: string;
}) {
  const setting: TJS.PartialArgs = {
    required: true,
    defaultProps: true,
  };
  const fail = (reason: string, error?: Error) => {
    logger.warn(`can't generate schema json for package: ${name}, because: ${reason}.`);
    if (error) {
      logger.error('error:', error);
    }
  };

  // find entry typescript file
  const indexTSPath = findPath(context, ['src/typing.ts', 'src/index.ts']);
  if (!indexTSPath) {
    return fail(`can't find "src/typing.ts" or "src/index.ts"`);
  }

  const schemaConfigPath = findPath(paths.root, ['schema.config.js']);
  if (schemaConfigPath) {
    const schemaConfig = loadFile<TJS.PartialArgs>(schemaConfigPath) || {};
    Object.assign(setting, schemaConfig);
  }

  // load typescript config
  const tsConfigJson =
    loadFile<{ compilerOptions: TJS.CompilerOptions }>(findPath(context, ['tsconfig.json'])) ||
    loadFile<{ compilerOptions: TJS.CompilerOptions }>(findProjectFilePath(['tsconfig'], ['json']) || '');
  if (!tsConfigJson) {
    return fail("can't find tsconfig.json!");
  }

  const options = tsConfigJson.compilerOptions;

  if (!options) {
    return fail("can't find compilerOptions in tsconfig.json!");
  }

  // build generator
  let program: TJS.Program | null | undefined = null;
  let generator: JsonSchemaGenerator | null | undefined = null;
  try {
    program = TJS.getProgramFromFiles([indexTSPath], options, context);
    generator = program && TJS.buildGenerator(program, setting, [indexTSPath]);
  } catch (error) {
    fail(`can't build typescript program generator.`, error);
    return;
  }
  if (!generator) {
    fail(`can't build typescript generator.`);
    return;
  }
  const mainFileSymbols = generator.getMainFileSymbols(program, [indexTSPath]);
  if (!(mainFileSymbols && mainFileSymbols.length > 0)) {
    fail(`mainFile symbols is empty, ${indexTSPath}`);
    return;
  }
  // find available component-props symbol
  const maySymbolNames = [`${caseStyle(name)}Props`, 'ComponentProps', 'Props'];
  const symbolName = maySymbolNames.find(maySymbolName => mainFileSymbols.includes(maySymbolName));
  if (!symbolName) {
    fail(`can't find props symbol from "${maySymbolNames}"`);
    return;
  }

  // get schema
  let schema;
  try {
    schema = await promiseTimeout(wrapPromise(generator.getSchemaForSymbol(symbolName)), 3000);
  } catch (error) {
    fail(`get schema by symbol "${symbolName}" fail:`, error);
    return;
  }
  if (typeof schema !== 'object' || schema === null) {
    fail(`get schema by symbol "${symbolName} is not valid`);
    return;
  }
  if (output) {
    await outputJSON(output, schema, { spaces: 2 });
  }
  return schema;
}
