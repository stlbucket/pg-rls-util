import { writeFileSync } from 'fs'
import {CommandBuilder} from 'yargs'
import loadConfig from '../../config'
import { PgrConfig, PgrDbIntrospection, PgrDiffSummary, PgrSchemaFunctionProfileAssignmentSet, PgrSchemaTableProfileAssignmentSet } from '../../d'
import {introspectDb} from '../../fn/introspect-db'

import findRemovedTables from './findRemovedTables'
import findAddedTables from './findAddedTables'
import findRemovedFunctions from './findRemovedFunctions'
import findAddedFunctions from './findAddedFunctions'


async function handler() {
  const config: PgrConfig = await loadConfig()
  const dbIntrospection = await introspectDb()

  const removedTableSecurityProfileAssignmentSets = await findRemovedTables(config, dbIntrospection)
  const addedTableSecurityProfileAssignmentSets = await findAddedTables(config, dbIntrospection)
  const removedFunctionSecurityProfileAssignmentSets = await findRemovedFunctions(config, dbIntrospection)
  const addedFunctionSecurityProfileAssignmentSets = await findAddedFunctions(config, dbIntrospection)

  const summary: PgrDiffSummary = {
    tableSecurityRemovals: removedTableSecurityProfileAssignmentSets,
    tableSecurityAdditions: addedTableSecurityProfileAssignmentSets,
    functionSecurityRemovals: removedFunctionSecurityProfileAssignmentSets,
    functionSecurityAdditions: addedFunctionSecurityProfileAssignmentSets
  }

  await writeFileSync(config.artifactPaths.currentDiffPath, JSON.stringify(summary,null,2))
    
  process.exit()
}


const command = 'diff'
const aliases = 'd'
const describe = 'examine differences between current draft assignments and db introspection'
const builder: CommandBuilder = {
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
