import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultTableSecurityProfiles from '../default/default-table-security-profiles'
import defaultFunctionSecurityProfiles from '../default/default-function-security-profiles'
import defaultPgrRoleSet from '../default/default-role-set'
import {introspectDb} from '../fn/introspect-db'
import {ConnectionConfig} from 'pg'
import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrSchemaFunctionProfileAssignmentSet } from '../d'
import {CommandBuilder} from 'yargs'

const baseDir = `${process.cwd()}/.pgrlsgen`
const currentDraftDir = `${baseDir}/current-draft`

async function  createBaseDir(argv) {
  if (argv.forceAll) {
   // @ts-ignore
   await rmdirSync(baseDir, {recursive: true})
  }

  const baseDirExists = await existsSync(baseDir)
  if (!baseDirExists) {
    console.log(`creating baseDir: ${baseDir}`)

    await mkdirSync(baseDir)

    // const connectionString = argv.connectionString
    // const dbConfigFilePath = `${currentDraftDir}/db-config.json`
    // const defaultDbConfig: ConnectionConfig = {
    //   connectionString: connectionString
    // }
    // await writeFileSync(dbConfigFilePath, JSON.stringify(defaultDbConfig,null,2))
  }
}

async function  buildCurrentDraftDir(argv: any, tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[], functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[]) {
  if (argv.force) {
    // @ts-ignore
    await rmdirSync(currentDraftDir, {recursive: true})
  }

  const currentDraftDirExists = await existsSync(currentDraftDir)
  if (!currentDraftDirExists) {
    await mkdirSync(currentDraftDir)
    const tableSecurityProfilesPath = `${currentDraftDir}/table-security-profiles.json`
    const functionSecurityProfilesPath = `${currentDraftDir}/function-security-profiles.json`
    const roleSetFilePath = `${currentDraftDir}/roles.json`
    const tableProfileAssignmentsPath = `${currentDraftDir}/table-profile-assignments.json`
    const functionSecurityProfileAssignmentsPath = `${currentDraftDir}/function-profile-assignments.json`

    await writeFileSync(tableSecurityProfilesPath, JSON.stringify(defaultTableSecurityProfiles,null,2))
    await writeFileSync(functionSecurityProfilesPath, JSON.stringify(defaultFunctionSecurityProfiles,null,2))
    await writeFileSync(roleSetFilePath, JSON.stringify(defaultPgrRoleSet,null,2))
    await writeFileSync(tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
    await writeFileSync(functionSecurityProfileAssignmentsPath, JSON.stringify(functionSecurityProfileAssignments,null,2))
  } else {
    console.log('current-draft already exists.  use -f or -x options to force re-init')
  }
}

async function  calcTableProfileAssignments(introspection:any): Promise<PgrSchemaTableProfileAssignmentSet[]> {
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
  return tableProfileAssignments

}

async function  calcFunctionSecurityProfileAssignments(introspection:any): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  const functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[] = introspection.schemaTree.map(
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
  return functionSecurityProfileAssignments
}

async function handler(argv) {
  await createBaseDir(argv)

  const introspection = await introspectDb()
  const tableProfileAssignments = await calcTableProfileAssignments(introspection)
  const functionProfileAssignments = await calcFunctionSecurityProfileAssignments(introspection)

  await buildCurrentDraftDir(argv, tableProfileAssignments, functionProfileAssignments)


  process.exit()
}

const command = 'init'
const aliases = 'i'
const describe = 'initialize the current draft or an entire project'
const builder: CommandBuilder = {
  c: { type: 'string', alias: 'connectionString', demandOption: true, description: 'postgres connection string'},
  f: { type: 'boolean', alias: 'force', description: 'will reset the current-draft to the previous version or to default if this is a new project' },
  x: { type: 'boolean', alias: 'forceAll', description: 'will reset the entire project' }
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}