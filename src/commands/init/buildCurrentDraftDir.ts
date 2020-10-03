import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import defaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import defaultPgrRoleSet from '../../default/default-role-set'
import defaultScriptTemplates from '../../default/default-script-templates'
import { PgrSchemaTableProfileAssignmentSet, PgrSchemaFunctionProfileAssignmentSet, PgrConfig } from '../../d'


async function  buildCurrentDraftDir(argv: any, config: PgrConfig, tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[], functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[]) {
  if (argv.force) {
    // @ts-ignore
    await rmdirSync(currentDraftDir, {recursive: true})
  }

  const currentDraftDirExists = await existsSync(config.currentDraftDirectory)
  if (!currentDraftDirExists) {
    await mkdirSync(config.currentDraftDirectory)
    await writeFileSync(config.artifactPaths.tableSecurityProfilesPath, JSON.stringify(defaultTableSecurityProfiles,null,2))
    await writeFileSync(config.artifactPaths.functionSecurityProfilesPath, JSON.stringify(defaultFunctionSecurityProfiles,null,2))
    await writeFileSync(config.artifactPaths.roleSetPath, JSON.stringify(defaultPgrRoleSet,null,2))
    await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
    await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(functionSecurityProfileAssignments,null,2))
    await writeFileSync(config.artifactPaths.scriptTemplatesPath, JSON.stringify(defaultScriptTemplates,null,2))
  } else {
    console.log('current-draft already exists.  use -f or -x options to force re-init')
  }
}

export default buildCurrentDraftDir