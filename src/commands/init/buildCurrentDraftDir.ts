import {mkdirSync, rmdirSync, existsSync, writeFileSync, write} from 'fs'
import getDefaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import getDefaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import getDefaultPgrRoleSet from '../../default/default-role-set'
import defaultScriptTemplates from '../../default/default-script-templates'
import { PgrConfig, PgrDbIntrospection } from '../../d'
import calcTableProfileAssignments from './calcTableProfileAssignments'
import calcFunctionSecurityProfileAssignments from './calcFunctionSecurityProfileAssignments'
import genJsonSchema from './gen-json-schemata'

async function getJsonSchema(typeName: string) {
  const jsonSchema = await genJsonSchema(typeName)
  return jsonSchema
}

async function writeOnefile(config: PgrConfig, artifactObject: any, filePath: string, typeName: string) {
  const jsonSchema = await getJsonSchema(typeName)
  await writeFileSync(filePath, JSON.stringify(artifactObject,null,2))
  await writeFileSync(`${config.currentDraftDirectory}/json-schema/${typeName}.json`, JSON.stringify(jsonSchema,null,2))
}

async function  buildCurrentDraftDir(argv: any, config: PgrConfig, introspection: PgrDbIntrospection) {
  if (argv.force) {
    // @ts-ignore
    await rmdirSync(currentDraftDir, {recursive: true})
  }

  const currentDraftDirExists = await existsSync(config.currentDraftDirectory)
  if (!currentDraftDirExists) {
    const defaultPgrRoleSet = await getDefaultPgrRoleSet(argv.roleSet)
    const defaultTableSecurityProfiles = await getDefaultTableSecurityProfiles(argv.roleSet)
    const defaultFunctionSecurityProfiles = await getDefaultFunctionSecurityProfiles(argv.roleSet)

    await mkdirSync(config.currentDraftDirectory)
    await mkdirSync(`${config.currentDraftDirectory}/json-schema`)

    await writeFileSync(config.artifactPaths.dbConfigPath, JSON.stringify(config.dbConfig,null,2))
    await writeFileSync(config.artifactPaths.projectConfigPath, JSON.stringify(config.projectConfig,null,2))

    await writeOnefile(config, defaultPgrRoleSet, config.artifactPaths.roleSetPath, 'PgrRoleSet')
    await writeOnefile(config, defaultTableSecurityProfiles, config.artifactPaths.tableSecurityProfilesPath, 'PgrTableSecurityProfileSet')
    await writeOnefile(config, defaultFunctionSecurityProfiles, config.artifactPaths.functionSecurityProfilesPath, 'PgrFunctionSecurityProfileSet')

    const tableProfileAssignments = await calcTableProfileAssignments(introspection, defaultTableSecurityProfiles)
    const functionProfileAssignments = await calcFunctionSecurityProfileAssignments(introspection, defaultFunctionSecurityProfiles)

    await writeOnefile(config, tableProfileAssignments, config.artifactPaths.tableProfileAssignmentsPath, 'PgrSchemaTableProfileAssignmentSet')
    await writeOnefile(config, functionProfileAssignments, config.artifactPaths.functionProfileAssignmentsPath, 'PgrSchemaFunctionProfileAssignmentSet')
    await writeOnefile(config, defaultScriptTemplates, config.artifactPaths.scriptTemplatesPath, 'PgrScriptTemplateSet')

    // await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
    // await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(functionProfileAssignments,null,2))
    // await writeFileSync(config.artifactPaths.scriptTemplatesPath, JSON.stringify(defaultScriptTemplates,null,2))
  } else {
    console.log('current-draft already exists.  use -f or -x options to force re-init')
  }
}

export default buildCurrentDraftDir
