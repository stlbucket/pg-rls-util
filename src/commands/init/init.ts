import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import defaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import defaultPgrRoleSet from '../../default/default-role-set'
import {introspectDb} from '../../introspect-db'
import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrSchemaFunctionProfileAssignmentSet, PgrDbIntrospection, PgrConfig } from '../../d'
import {CommandBuilder} from 'yargs'
import loadConfig from '../../config'
let config: PgrConfig

import createBaseDir from './createBaseDir'
import buildCurrentDraftDir from './buildCurrentDraftDir'
import calcTableProfileAssignments from './calcTableProfileAssignments'
import calcFunctionSecurityProfileAssignments from './calcFunctionSecurityProfileAssignments'


async function handler(argv) {
  config = await loadConfig()
  await createBaseDir(argv, config)

  const introspection = await introspectDb()
  const tableProfileAssignments = await calcTableProfileAssignments(introspection)
  const functionProfileAssignments = await calcFunctionSecurityProfileAssignments(introspection)

  await buildCurrentDraftDir(argv, config, tableProfileAssignments, functionProfileAssignments)


  process.exit()
}

const command = 'init'
const aliases = 'i'
const describe = 'initialize the current draft or an entire project'
const builder: CommandBuilder = {
  f: { type: 'boolean', alias: 'force', description: 'will reset the current-draft to the previous version or to default if this is a new project' },
  x: { type: 'boolean', alias: 'forceAll', description: 'will reset the entire project' }
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}