import {existsSync, readFileSync} from 'fs'
import { ConnectionConfig } from 'pg'
import { PgrConfig, PgrDiffSummary, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrGenerateOptions, PgrProjectConfig, PgrRoleSet, PgrSchemaTableProfileAssignmentSet, PgrScriptTemplateSet, PgrTableSecurityProfileSet } from './d'

const baseDirectory = process.env.PGR_WORK_DIR || `${process.cwd()}/pg-rls-util-gen`
const releasesDirectory = `${baseDirectory}/releases`

// current-draft paths
const currentDraftDirectory = `${baseDirectory}/current-draft`
const roleSetPath = `${currentDraftDirectory}/roles.json`
const tableProfileAssignmentsPath = `${currentDraftDirectory}/table-profile-assignments.json`
const tableProfileAssignmentsStagedPath = `${currentDraftDirectory}/table-profile-assignments-staged.json`
const tableSecurityProfilesPath = `${currentDraftDirectory}/table-security-profiles.json`
const functionProfileAssignmentsPath = `${currentDraftDirectory}/function-profile-assignments.json`
const functionProfileAssignmentsStagedPath = `${currentDraftDirectory}/function-profile-assignments-staged.json`
const functionSecurityProfilesPath = `${currentDraftDirectory}/function-security-profiles.json`
const scriptTemplatesPath = `${currentDraftDirectory}/script-templates.json`
const currentDiffPath = `${currentDraftDirectory}/current-diff.json`
const dbConfigPath = `${currentDraftDirectory}/db-config.json`
const projectConfigPath = `${currentDraftDirectory}/project-config.json`
const generateOptionsPath = `${currentDraftDirectory}/generate-options.json`

// artifact paths
const artifactsDirectory = `${currentDraftDirectory}/artifacts`
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

  const connectionString = process.env.PGR_DB_CONNECTION_STRING || argv.connectionString

  const dbConfig: ConnectionConfig =
  connectionString ? { connectionString: connectionString } :
    (await loadOneConfigFile(dbConfigPath))

  if (!dbConfig.connectionString) {
    console.error("ConnectionString must be defined in one of three ways:  process.env.PGR_DB_CONNECTION_STRING; argv.connectionString; current-draft/db-config.json")
    process.exit(1)
  }

  const schemata = process.env.PGR_SCHEMATA || argv.schemata

  const projectConfig: PgrProjectConfig =
    schemata ? { schemata: schemata } :
    (await loadOneConfigFile(projectConfigPath))

  if (!projectConfig.schemata) {
    console.error("Schemata must be defined in one of three ways:  process.env.PGR_SCHEMATA; argv.schemata; current-draft/project-config.json")
    process.exit(1)
  }

  const roles: PgrRoleSet = await loadOneConfigFile(roleSetPath)
  const tableSecurityProfiles: PgrTableSecurityProfileSet = await loadOneConfigFile(tableSecurityProfilesPath)
  const functionSecurityProfiles: PgrFunctionSecurityProfileSet = await loadOneConfigFile(functionSecurityProfilesPath)
  const tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = await loadOneConfigFile(tableProfileAssignmentsPath)
  const functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[] = await loadOneConfigFile(functionProfileAssignmentsPath)
  const scriptTemplates: PgrScriptTemplateSet = await loadOneConfigFile(scriptTemplatesPath)
  const currentDiff: PgrDiffSummary = await loadOneConfigFile(currentDiffPath)
  const generateOptions: PgrGenerateOptions = await loadOneConfigFile(generateOptionsPath)

  config = {
    argv: argv,
    baseDirectory: baseDirectory,
    currentDraftDirectory: currentDraftDirectory,
    projectConfig: projectConfig,
    dbConfig: dbConfig,
    schemata: projectConfig.schemata,
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
      schemaUsageSqlPath: schemaUsageSqlPath,
      dbConfigPath: dbConfigPath,
      projectConfigPath: projectConfigPath,
      generateOptionsPath: generateOptionsPath
    },
    scriptTemplates: scriptTemplates,
    generateOptions: generateOptions
  }

  return config
}

export default loadConfig
