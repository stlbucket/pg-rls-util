import {CommandBuilder} from 'yargs'
import {mkdirSync, existsSync, readdirSync} from 'fs'
const util = require('util');
const exec = util.promisify(require('child_process').exec);

import loadConfig from '../config'
import { PgrConfig } from '../d';

let config: PgrConfig

async function handler(argv) {
  if (argv.connectionString) process.env.PGR_DB_CONNECTION_STRING = argv.connectionString
  if (argv.schemata) process.env.PGR_SCHEMATA = argv.schemata
  config = await loadConfig(argv)

  const releasesDirExists = await existsSync(config.releasesDirectory)
  if (!releasesDirExists) {
    console.log(`creating releasesDir: ${config.releasesDirectory}`)
    await mkdirSync(config.releasesDirectory)
  }

  const existingReleases: number[] = (await readdirSync(config.releasesDirectory)).map((r:string) => parseInt(r))
  const thisReleaseNumber = existingReleases.length > 0 ? (Math.max(...existingReleases) + 1) : 1
  const thisReleaseDir = `${config.releasesDirectory}/${thisReleaseNumber.toString().padStart(6,'0')}/`

  await exec(`cp -R ${config.currentDraftDirectory} ${thisReleaseDir}`);

  process.exit()
}


const command = 'release'
const aliases = 'r'
const describe = 'copy current-draft dir to a new release dir'
const builder: CommandBuilder = {
  c: { type: 'string', alias: 'connectionString', description: 'a postgres connection string that will define/override PGR_DB_CONNECTION_STRING env variable'},
  s: { type: 'string', alias: 'schemata', description: 'a comma-delimited string of databse schemas to work with'}
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
