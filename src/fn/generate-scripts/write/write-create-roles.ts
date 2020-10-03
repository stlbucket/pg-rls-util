import { writeFileSync } from 'fs'
import loadConfig from '../../../config'

async function writeCreateRolesSql (allScripts: string) {
  const config = await loadConfig()
  
  await writeFileSync(config.artifactPaths.createRolesPath, allScripts)
}

export default writeCreateRolesSql

