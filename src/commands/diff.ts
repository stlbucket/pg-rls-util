import {CommandBuilder} from 'yargs'
// import {mkdirSync, existsSync, readdirSync} from 'fs'
import loadConfig from '../config'
import { PgrConfig } from '../d'
import {introspectDb} from '../fn/introspect-db'
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// const baseDir = `${process.cwd()}/.pgrlsgen`
// const currentDraftDir = `${baseDir}/current-draft`
// const releasesDir = `${baseDir}/releases`

async function handler() {
  const config: PgrConfig = await loadConfig()
  const dbIntrospection = await introspectDb()

  // const configSchemata = config
  // const newSchemata = 

  console.log(config)
  console.log(dbIntrospection)

  // get introspection

  // get current table assignment
  // reduce to find new tables, views, functions with default policies
  // reduce to find dropped tables, views, function
  // write diff json file
    
  process.exit()
}


const command = 'diff'
const aliases = 'd'
const describe = 'examine differences between current draft assignments and db introspection'
const builder: CommandBuilder = {
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
