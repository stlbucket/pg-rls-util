import {rmdirSync, mkdirSync} from 'fs'
import { PgrScriptSet } from '../../../../d'
import loadConfig from '../../../../config'

async function writeDirectories(scriptSet: PgrScriptSet) {
  scriptSet
  const config = await loadConfig()
  // @ts-ignore
  await rmdirSync(config.artifactsDirectory, {recursive: true})
  await mkdirSync(config.artifactsDirectory)
}

export default writeDirectories