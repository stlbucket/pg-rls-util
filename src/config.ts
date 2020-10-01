import {existsSync, readFileSync} from 'fs'
import { PgrConfig, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrRoleSet, PgrSchemaTableProfileAssignmentSet, PgrTableSecurityProfileSet } from './d'

let config: PgrConfig | null = null;

async function loadOneConfigFile(filePath:string): Promise<any | null> {
  const fileExists = await existsSync(filePath)
  if (!fileExists) return null

  const fileContents = await readFileSync(filePath)
  return JSON.parse(fileContents.toString())
}

async function loadConfig(): Promise<PgrConfig> {
  if (config !== null) return config;

  const baseDirectory = process.env.PGR_WORK_DIR || `${process.cwd()}/.pgrlsgen`
  const cwd = `${baseDirectory}/current-draft`
  const rPath = `${cwd}/roles.json`
  const tpaPath = `${cwd}/table-profile-assignments.json`
  const tspPath = `${cwd}/table-security-profiles.json`
  const fpaPath = `${cwd}/function-profile-assignments.json`
  const fspPath = `${cwd}/function-security-profiles.json`
  const artifactsDirectory = `${cwd}/artifacts`
  const releasesDirectory = `${baseDirectory}/releases`

  const connectionString = process.env.PGR_DB_CONNECTION_STRING

  if (!connectionString) throw new Error("Environment variable PGR_DB_CONNECTION_STRING must be defined for pg-rls-util")

  const roles: PgrRoleSet = await loadOneConfigFile(rPath)
  const tableSecurityProfiles: PgrTableSecurityProfileSet = await loadOneConfigFile(tspPath)
  const functionSecurityProfiles: PgrFunctionSecurityProfileSet = await loadOneConfigFile(fspPath)
  const tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = await loadOneConfigFile(tpaPath)
  const functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[] = await loadOneConfigFile(fpaPath)

  config = {
    baseDirectory: baseDirectory,
    currentDraftDirectory: cwd,
    dbConfig: {connectionString: connectionString},
    artifactsDirectory: artifactsDirectory,
    releasesDirectory: releasesDirectory,
    roleSet: roles,
    tableSecurityProfileSet: tableSecurityProfiles,
    tableSecurityProfileAssignments: tableSecurityProfileAssignments,
    functionSecurityProfileSet: functionSecurityProfiles,
    functionSecurityProfileAssignments: functionSecurityProfileAssignments
  }

  return config
}

export default loadConfig