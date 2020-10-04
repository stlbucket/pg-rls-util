import {introspectDb} from '../introspect-db'
import { PgrConfig } from '../d'
import {CommandBuilder} from 'yargs'
import loadConfig from '../config'
let config: PgrConfig

import createBaseDir from './init/createBaseDir'
import buildCurrentDraftDir from './init/buildCurrentDraftDir'
import calcTableProfileAssignments from './init/calcTableProfileAssignments'
import calcFunctionSecurityProfileAssignments from './init/calcFunctionSecurityProfileAssignments'


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