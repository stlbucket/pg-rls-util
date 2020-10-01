import {CommandBuilder} from 'yargs'
import {mkdirSync, existsSync, readdirSync} from 'fs'
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const baseDir = `${process.cwd()}/.pgrlsgen`
const currentDraftDir = `${baseDir}/current-draft`
const releasesDir = `${baseDir}/releases`

async function handler() {
    
  const releasesDirExists = await existsSync(releasesDir)
  if (!releasesDirExists) {
    console.log(`creating releasesDir: ${releasesDir}`)
    await mkdirSync(releasesDir)
  }

  const existingReleases: number[] = (await readdirSync(releasesDir)).map((r:string) => parseInt(r))
  const thisReleaseNumber = existingReleases.length > 0 ? (Math.max(...existingReleases) + 1) : 1
  const thisReleaseDir = `${releasesDir}/${thisReleaseNumber.toString().padStart(6,'0')}/`

  await exec(`cp -R ${currentDraftDir} ${thisReleaseDir}`);

  process.exit()
}


const command = 'release'
const aliases = 'r'
const describe = 'copy current-draft dir to a new release dir'
const builder: CommandBuilder = {
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
