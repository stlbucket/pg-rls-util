import {introspectDb} from '../introspect-db'
import { PgrConfig } from '../d'
import {CommandBuilder} from 'yargs'
import loadConfig from '../config'
let config: PgrConfig

import createBaseDir from './init/createBaseDir'
import buildCurrentDraftDir from './init/buildCurrentDraftDir'


async function handler(argv) {
  if (argv.connectionString) process.env.PGR_DB_CONNECTION_STRING = argv.connectionString
  if (argv.schemata) process.env.PGR_SCHEMATA = argv.schemata
  config = await loadConfig(argv)
  await createBaseDir(argv, config)

  const introspection = await introspectDb()

  await buildCurrentDraftDir(argv, config, introspection)


  process.exit()
}

const command = 'init'
const aliases = 'i'
const describe = 'initialize the current draft or an entire project'
const builder: CommandBuilder = {
  c: { type: 'string', alias: 'connectionString', description: 'a postgres connection string that will define/override PGR_DB_CONNECTION_STRING env variable'},
  s: { type: 'string', alias: 'schemata', description: 'a comma-delimited string of database schemas to work with'},
  f: { type: 'boolean', alias: 'force', description: 'will reset the current-draft to the previous version or to default if this is a new project' },
  x: { type: 'boolean', alias: 'forceAll', description: 'will reset the entire project' },
  p: { type: 'string', alias: 'profile-set', description: 'the rls-strategy profile-set starter for this project', choices: ['graphile-starter', 'app-jwt', 'app-with-admin', 'other'], demandOption: true},
  q: { type: 'string', alias: 'custom-profile-set', description: 'path to json file defining rls-strategy profile-set starter for this project.  used in conjunction with "custom" profile set option', demandOption: false}
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
