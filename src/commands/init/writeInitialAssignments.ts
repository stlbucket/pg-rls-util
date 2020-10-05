import {writeFileSync} from 'fs'
import { PgrSchemaTableProfileAssignmentSet, PgrSchemaFunctionProfileAssignmentSet, PgrConfig } from '../../d'


async function  buildCurrentDraftDir(config: PgrConfig, tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[], functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[]) {
  await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
  await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(functionSecurityProfileAssignments,null,2))
}

export default buildCurrentDraftDir