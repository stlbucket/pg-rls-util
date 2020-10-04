import {introspectDb} from '../introspect-db'
import generateAllScripts from './generate/generate-scripts/generate-all-scripts'
import {CommandBuilder} from 'yargs'

async function handler() {    
  const introspection = await introspectDb()
  await generateAllScripts(introspection)

  process.exit()
}


const command = 'generate'
const aliases = 'g'
const describe = 'generate all policy scripts'
const builder: CommandBuilder = {
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}