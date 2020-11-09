import { PgrGenerateOptions } from "../d";

const generateOptions: PgrGenerateOptions = {
  "masterScript": {
    "includeRemoveRls": true,
    "includeSchemaUsage": true,
    "includeOwnership": true,
    "includeTableSecurity": true,
    "includeFunctionSecurity": true
  },
  "functionScripts": {
    "disableSecurityDefinerOwnershipGrants": true
  }
}

export default generateOptions
