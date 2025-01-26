import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql",
  generates: {
    "schema.graphql": {
      plugins: ["schema-ast"]
    }
  }
};

export default config; 
