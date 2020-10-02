import { PgrDbIntrospection } from '../../d'
import computeOwnershipPolicy from './compute/compute-ownership-script'
import writeOwnershipPolicy from './write/write-ownership-policy'

async function generateOwnershipPolicy(introspection: PgrDbIntrospection) {
  const ownershipPolicy = await computeOwnershipPolicy(introspection)
  await writeOwnershipPolicy(ownershipPolicy)
}

export default generateOwnershipPolicy