import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import getDefaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import getDefaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import getDefaultPgrRoleSet from '../../default/default-role-set'
import defaultScriptTemplates from '../../default/default-script-templates'
import { PgrConfig, PgrDbIntrospection } from '../../d'
import calcTableProfileAssignments from './calcTableProfileAssignments'
import calcFunctionSecurityProfileAssignments from './calcFunctionSecurityProfileAssignments'


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
    await writeFileSync(config.artifactPaths.tableSecurityProfilesPath, JSON.stringify(defaultTableSecurityProfiles,null,2))
    await writeFileSync(config.artifactPaths.functionSecurityProfilesPath, JSON.stringify(defaultFunctionSecurityProfiles,null,2))
    await writeFileSync(config.artifactPaths.roleSetPath, JSON.stringify(defaultPgrRoleSet,null,2))

    const tableProfileAssignments = await calcTableProfileAssignments(introspection, defaultTableSecurityProfiles)
    const functionProfileAssignments = await calcFunctionSecurityProfileAssignments(introspection, defaultFunctionSecurityProfiles)
  
    await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
    await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(functionProfileAssignments,null,2))
    await writeFileSync(config.artifactPaths.scriptTemplatesPath, JSON.stringify(defaultScriptTemplates,null,2))
  } else {
    console.log('current-draft already exists.  use -f or -x options to force re-init')
  }
}

export default buildCurrentDraftDir