import {existsSync, readFileSync} from 'fs'
import { PgrConfig, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrRoleSet, PgrSchemaTableProfileAssignmentSet, PgrTableSecurityProfileSet } from './d'
// const dbConfigPath = `${process.cwd()}/.pgrlsgen/current-draft/db-config.json`
// let dbConfig = {
//   connectionString: "NO DB CONFIG"
// }

let config: PgrConfig | null = null;

async function loadOneConfigFile(filePath:string): Promise<any | null> {
  const fileExists = await existsSync(filePath)
  if (!fileExists) return null

  const fileContents = await readFileSync(filePath)
  return JSON.parse(fileContents.toString())
}

async function loadConfig(workDir?: string): Promise<PgrConfig> {
  if (config !== null) return config;

  const cwd = workDir || `${process.cwd()}/.pgrlsgen/current-draft`

  const rPath = `${cwd}/roles.json`
  const tpaPath = `${cwd}/table-profile-assignments.json`
  const tspPath = `${cwd}/table-security-profiles.json`
  const fpaPath = `${cwd}/function-profile-assignments.json`
  const fspPath = `${cwd}/function-security-profiles.json`
  const artifactsDirectory = `${cwd}/artifacts`

  // const dbConfigExists = await existsSync(dbConfigPath)
  // if (dbConfigExists) {
  //   const dbConfigContents = await readFileSync(dbConfigPath)
  //   dbConfig = JSON.parse(dbConfigContents.toString())
  // }
  const connectionString = process.env.PGR_DB_CONNECTION_STRING || "postgres://postgres:1234@0.0.0.0/soro_sales"

  const roles: PgrRoleSet = await loadOneConfigFile(rPath)
  const tableSecurityProfiles: PgrTableSecurityProfileSet = await loadOneConfigFile(tspPath)
  const functionSecurityProfiles: PgrFunctionSecurityProfileSet = await loadOneConfigFile(fspPath)
  const tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = await loadOneConfigFile(tpaPath)
  const functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[] = await loadOneConfigFile(fpaPath)

  config = {
    dbConfig: {connectionString: connectionString},
    artifactsDirectory: artifactsDirectory,
    roleSet: roles,
    tableSecurityProfileSet: tableSecurityProfiles,
    tableSecurityProfileAssignments: tableSecurityProfileAssignments,
    functionSecurityProfileSet: functionSecurityProfiles,
    functionSecurityProfileAssignments: functionSecurityProfileAssignments
  }

  return config
}

export default loadConfig