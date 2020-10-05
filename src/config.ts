import {existsSync, readFileSync} from 'fs'
import { PgrConfig, PgrDiffSummary, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrRoleSet, PgrSchemaTableProfileAssignmentSet, PgrScriptTemplateSet, PgrTableSecurityProfileSet } from './d'

const baseDirectory = process.env.PGR_WORK_DIR || `${process.cwd()}/.pgrlsgen`
const currentDraftDirectory = `${baseDirectory}/current-draft`
const artifactsDirectory = `${currentDraftDirectory}/artifacts`
const releasesDirectory = `${baseDirectory}/releases`
const roleSetPath = `${currentDraftDirectory}/roles.json`
const tableProfileAssignmentsPath = `${currentDraftDirectory}/table-profile-assignments.json`
const tableProfileAssignmentsStagedPath = `${currentDraftDirectory}/table-profile-assignments-staged.json`
const tableSecurityProfilesPath = `${currentDraftDirectory}/table-security-profiles.json`
const functionProfileAssignmentsPath = `${currentDraftDirectory}/function-profile-assignments.json`
const functionProfileAssignmentsStagedPath = `${currentDraftDirectory}/function-profile-assignments-staged.json`
const functionSecurityProfilesPath = `${currentDraftDirectory}/function-security-profiles.json`
const scriptTemplatesPath = `${currentDraftDirectory}/script-templates.json`
const currentDiffPath = `${currentDraftDirectory}/current-diff.json`
const createRolesPath = `${artifactsDirectory}/create-roles.sql`
const ownershipPath = `${artifactsDirectory}/ownership.sql`
const removeAllRlsPath = `${artifactsDirectory}/remove-all-rls.sql`
const schemaUsageSqlPath = `${artifactsDirectory}/schema-usage.sql`
const oneScriptToRuleThemAllPath = `${artifactsDirectory}/one-script-to-rule-them-all.sql`


let config: PgrConfig | null = null;

const defaultDiff: PgrDiffSummary = {
  tableSecurityRemovals: [],
  tableSecurityAdditions: [],
  functionSecurityRemovals: [],
  functionSecurityAdditions: [],
}

async function loadOneConfigFile(filePath:string): Promise<any | null> {
  const fileExists = await existsSync(filePath)
  if (!fileExists) return null

  const fileContents = await readFileSync(filePath)
  return JSON.parse(fileContents.toString())
}

async function loadConfig(argv?: any): Promise<PgrConfig> {
  if (config !== null) return config;
  if (!argv) throw new Error('Initial config load must include argv parameter')

  const connectionString = process.env.PGR_DB_CONNECTION_STRING

  if (!connectionString) {
    console.error("Environment variable PGR_DB_CONNECTION_STRING must be defined for pg-rls-util.  you can also use the --connectionString flag.")
    process.exit(1)
  }

  const schemata = process.env.PGR_SCHEMATA

  if (!schemata) {
    console.error("Environment variable PGR_SCHEMATA must be defined for pg-rls-util.  you can also use the --schemata flag.")
    process.exit(1)
  }

  const roles: PgrRoleSet = await loadOneConfigFile(roleSetPath)
  const tableSecurityProfiles: PgrTableSecurityProfileSet = await loadOneConfigFile(tableSecurityProfilesPath)
  const functionSecurityProfiles: PgrFunctionSecurityProfileSet = await loadOneConfigFile(functionSecurityProfilesPath)
  const tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = await loadOneConfigFile(tableProfileAssignmentsPath)
  const functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[] = await loadOneConfigFile(functionProfileAssignmentsPath)
  const scriptTemplates: PgrScriptTemplateSet = await loadOneConfigFile(scriptTemplatesPath)
  const currentDiff: PgrDiffSummary = await loadOneConfigFile(currentDiffPath)
// console.log(tableSecurityProfiles, tableSecurityProfilesPath)
// process.exit()
  config = {
    argv: argv,
    baseDirectory: baseDirectory,
    currentDraftDirectory: currentDraftDirectory,
    dbConfig: {connectionString: connectionString},
    schemata: schemata,
    artifactsDirectory: artifactsDirectory,
    releasesDirectory: releasesDirectory,
    roleSet: roles,
    tableSecurityProfileSet: tableSecurityProfiles,
    tableSecurityProfileAssignmentSets: tableSecurityProfileAssignments,
    functionSecurityProfileSet: functionSecurityProfiles,
    functionSecurityProfileAssignments: functionSecurityProfileAssignments,
    currentDiff: currentDiff || defaultDiff,
    artifactPaths: {
      tableProfileAssignmentsPath: tableProfileAssignmentsPath,
      tableProfileAssignmentsStagedPath: tableProfileAssignmentsStagedPath,
      tableSecurityProfilesPath: tableSecurityProfilesPath,
      functionProfileAssignmentsPath: functionProfileAssignmentsPath,
      functionProfileAssignmentsStagedPath: functionProfileAssignmentsStagedPath,
      functionSecurityProfilesPath: functionSecurityProfilesPath,
      scriptTemplatesPath: scriptTemplatesPath,
      currentDiffPath: currentDiffPath,
      roleSetPath: roleSetPath,
      createRolesPath: createRolesPath,
      ownershipPath: ownershipPath,
      removeAllRlsPath: removeAllRlsPath,
      oneScriptToRuleThemAllPath: oneScriptToRuleThemAllPath,
      schemaUsageSqlPath: schemaUsageSqlPath
    },
    scriptTemplates: scriptTemplates
  }

  return config
}

export default loadConfig