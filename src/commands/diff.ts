import { writeFileSync } from 'fs'
import {CommandBuilder} from 'yargs'
import loadConfig from '../config'
import { PgrConfig, PgrDiffSummary } from '../d'
import {introspectDb} from '../introspect-db'

import findRemovedTables from './diff/findRemovedTables'
import findAddedTables from './diff/findAddedTables'
import findRemovedFunctions from './diff/findRemovedFunctions'
import findAddedFunctions from './diff/findAddedFunctions'


async function handler(argv) {
  if (argv.connectionString) process.env.PGR_DB_CONNECTION_STRING = argv.connectionString
  if (argv.schemata) process.env.PGR_SCHEMATA = argv.schemata
  const config: PgrConfig = await loadConfig(argv)
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
  c: { type: 'string', alias: 'connectionString', description: 'a postgres connection string that will define/override PGR_DB_CONNECTION_STRING env variable'},
  s: { type: 'string', alias: 'schemata', description: 'a comma-delimited string of databse schemas to work with'}
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
