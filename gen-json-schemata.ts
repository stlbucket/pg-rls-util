import { resolve } from "path";

import * as TJS from "typescript-json-schema";

async function genJsonSchema (typename: string): Promise<any> {
  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    required: true,
  };

  // optionally pass ts compiler options
  const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
  };

  // optionally pass a base path
  const basePath = ".";

  const program = TJS.getProgramFromFiles(
    [resolve("src/d.ts")],
    compilerOptions,
    basePath
  );

  // We can either get the schema for one file and one type...
  const schema = TJS.generateSchema(program, typename, settings);

  return schema

}

export default genJsonSchema
