import { writeFileSync } from 'fs';
import loadConfig from '../../../config'

async function writeOwnershipPolicy(ownershipPolicy: string) {
  const config = await loadConfig()
  await writeFileSync(config.artifactPaths.ownershipPath, ownershipPolicy)
}

export default writeOwnershipPolicy