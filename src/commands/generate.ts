import {introspectDb} from '../introspect-db'
import generateAllScripts from './generate/generate-scripts/generate-all-scripts'
import {CommandBuilder} from 'yargs'
import loadConfig from '../config'
import { PgrConfig } from '../d'
let config: PgrConfig

async function handler(argv) {
  if (argv.connectionString) process.env.PGR_DB_CONNECTION_STRING = argv.connectionString
  config = await loadConfig(argv)
  const introspection = await introspectDb()
  await generateAllScripts(introspection)

  process.exit()
}


const command = 'generate'
const aliases = 'g'
const describe = 'generate all policy scripts'
const builder: CommandBuilder = {
  c: { type: 'string', alias: 'connectionString', description: 'a postgres connection string that will define/override PGR_DB_CONNECTION_STRING env variable'}
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}