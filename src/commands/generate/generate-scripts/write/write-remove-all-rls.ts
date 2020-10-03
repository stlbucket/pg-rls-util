import { writeFileSync } from 'fs'
import loadConfig from '../../../../config'

async function writeRemoveAllRlsPolicy (allScripts: string) {
  const config = await loadConfig()
  await writeFileSync(config.artifactPaths.removeAllRlsPath, allScripts)
}

export default writeRemoveAllRlsPolicy

