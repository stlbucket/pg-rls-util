import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultTableSecurityProfiles from '../default/default-table-security-profiles'
import defaultFunctionSecurityProfiles from '../default/default-function-security-profiles'
import defaultPgrRoleSet from '../default/default-role-set'
import {introspectDb} from '../fn/introspect-db'
// import {PgrSchema, PgrTable, PgrSchemaTableProfileAssignmentSet} from '../d'
import {ConnectionConfig} from 'pg'
import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable } from '../d'

const baseDir = `${process.cwd()}/.pgrlsgen`
const currentDraftDir = `${baseDir}/current-draft`

async function  doBaseDir(argv) {
  if (argv.forceAll) {
   // @ts-ignore
   await rmdirSync(baseDir, {recursive: true})
  }

  const baseDirExists = await existsSync(baseDir)
  if (!baseDirExists) {
    console.log(`creating baseDir: ${baseDir}`)
    await mkdirSync(baseDir)
  }
}

async function  doCurrentDraftDir(argv) {
  const connectionString = argv.connectionString
  if (argv.force) {
    // @ts-ignore
    await rmdirSync(currentDraftDir, {recursive: true })
  }

  const currentDraftDirExists = await existsSync(currentDraftDir)
  if (!currentDraftDirExists) {
    const defaultDbConfig: ConnectionConfig = {
      connectionString: connectionString
    }
    const tableSecurityProfilesPath = `${currentDraftDir}/table-security-profiles.json`
    const functionSecurityProfilesPath = `${currentDraftDir}/function-security-profiles.json`
    const roleSetFilePath = `${currentDraftDir}/roles.json`
    const dbConfigFilePath = `${currentDraftDir}/db-config.json`
    await mkdirSync(currentDraftDir)
    await writeFileSync(tableSecurityProfilesPath, JSON.stringify(defaultTableSecurityProfiles,null,2))
    await writeFileSync(functionSecurityProfilesPath, JSON.stringify(defaultFunctionSecurityProfiles,null,2))
    await writeFileSync(roleSetFilePath, JSON.stringify(defaultPgrRoleSet,null,2))
    await writeFileSync(dbConfigFilePath, JSON.stringify(defaultDbConfig,null,2))
  }

  return {
    securityProfiles: defaultTableSecurityProfiles
  }
}

async function  doTableProfileAssignments(introspection:any) {
  const tableProfileAssignmentsPath = `${currentDraftDir}/table-profile-assignments.json`
  const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const tableAssignments = s.schemaTables.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
          }
        }, {}
      )
      const viewAssignments = s.schemaViews.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
          }
        }, {}
      )
      return {
        schemaName: s.schemaName,
        tableAssignments: tableAssignments,
        viewAssignments: viewAssignments
      }
    }
  )
  await writeFileSync(tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
}

async function  doFunctionSecurityProfileAssignments(introspection:any) {
  const functionSecurityProfileAssignmentsPath = `${currentDraftDir}/function-profile-assignments.json`
  const functionSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const functionAssignments = s.schemaFunctions.reduce(
        (a: any, f:any) => {
          return {
            ...a,
            [f.functionName]: defaultFunctionSecurityProfiles.defaultProfileName
          }
        }, {}
      )
      return {
        schemaName: s.schemaName,
        functionAssignments: functionAssignments
      }
    }
  )
  await writeFileSync(functionSecurityProfileAssignmentsPath, JSON.stringify(functionSecurityProfileAssignments,null,2))
}

async function run(argv) {
  // const connectionString = argv.connectionString

  await doBaseDir(argv)
  await doCurrentDraftDir(argv)

  const introspection = await introspectDb()
  await doTableProfileAssignments(introspection)
  await doFunctionSecurityProfileAssignments(introspection)

  process.exit()
}

export default run