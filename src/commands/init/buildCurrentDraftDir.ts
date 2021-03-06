import {mkdirSync, rmdirSync, existsSync, writeFileSync, write} from 'fs'
import getDefaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import getDefaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import getDefaultPgrRoleSet from '../../default/default-role-set'
import defaultScriptTemplates from '../../default/default-script-templates'
import defaultGenerateOptions from '../../default/default-generate-options'
import { PgrConfig, PgrDbIntrospection } from '../../d'
import calcTableProfileAssignments from './calcTableProfileAssignments'
import calcFunctionSecurityProfileAssignments from './calcFunctionSecurityProfileAssignments'
// import genJsonSchema from './gen-json-schemata'

// async function getJsonSchema(typeName: string) {
//   const jsonSchema = await genJsonSchema(typeName)
//   return jsonSchema
// }

async function writeOnefile(artifactObject: any, filePath: string) {
  // const jsonSchema = await getJsonSchema(typeName)
  await writeFileSync(filePath, JSON.stringify(artifactObject,null,2))
  // await writeFileSync(`${config.currentDraftDirectory}/json-schema/${typeName}.json`, JSON.stringify(jsonSchema,null,2))
}

async function  buildCurrentDraftDir(argv: any, config: PgrConfig, introspection: PgrDbIntrospection) {
  if (argv.force) {
    // @ts-ignore
    await rmdirSync(currentDraftDir, {recursive: true})
  }

  const currentDraftDirExists = await existsSync(config.currentDraftDirectory)
  if (!currentDraftDirExists) {
    const defaultPgrRoleSet = await getDefaultPgrRoleSet(argv.profileSet)
    const defaultTableSecurityProfiles = await getDefaultTableSecurityProfiles(argv.profileSet)
    const defaultFunctionSecurityProfiles = await getDefaultFunctionSecurityProfiles(argv.profileSet)

    await mkdirSync(config.currentDraftDirectory)
    await mkdirSync(`${config.currentDraftDirectory}/json-schema`)

    await writeFileSync(config.artifactPaths.dbConfigPath, JSON.stringify(config.dbConfig,null,2))
    await writeFileSync(config.artifactPaths.projectConfigPath, JSON.stringify(config.projectConfig,null,2))

    await writeOnefile(defaultPgrRoleSet, config.artifactPaths.roleSetPath)
    await writeOnefile(defaultTableSecurityProfiles, config.artifactPaths.tableSecurityProfilesPath)
    await writeOnefile(defaultFunctionSecurityProfiles, config.artifactPaths.functionSecurityProfilesPath)

    const tableProfileAssignments = await calcTableProfileAssignments(introspection, defaultTableSecurityProfiles)
    const functionProfileAssignments = await calcFunctionSecurityProfileAssignments(introspection, defaultFunctionSecurityProfiles)

    await writeOnefile(tableProfileAssignments, config.artifactPaths.tableProfileAssignmentsPath)
    await writeOnefile(functionProfileAssignments, config.artifactPaths.functionProfileAssignmentsPath)
    await writeOnefile(defaultScriptTemplates, config.artifactPaths.scriptTemplatesPath)
    await writeOnefile(defaultGenerateOptions, config.artifactPaths.generateOptionsPath)

    // await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
    // await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(functionProfileAssignments,null,2))
    // await writeFileSync(config.artifactPaths.scriptTemplatesPath, JSON.stringify(defaultScriptTemplates,null,2))
  } else {
    console.log('current-draft already exists.  use -f or -x options to force re-init')
  }
}

export default buildCurrentDraftDir
