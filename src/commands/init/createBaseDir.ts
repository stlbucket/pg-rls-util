import {mkdirSync, rmdirSync, existsSync} from 'fs'
import { PgrConfig } from '../../d'

async function  createBaseDir(argv, config) {
  if (argv.forceAll) {
   // @ts-ignore - recursive option is not in types
   await rmdirSync(config.baseDirectory, {recursive: true})
  }

  const baseDirectoryExists = await existsSync(config.baseDirectory)
  if (!baseDirectoryExists) {
    console.log(`creating config.baseDirectory: ${config.baseDirectory}`)

    await mkdirSync(config.baseDirectory)
  }
}

export default createBaseDir
