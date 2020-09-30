import computeRemoveRls from './compute/compute-remove-all-rls-script'
import writeRemoveAllRlsPolicy from './write/write-remove-all-rls'

async function generateRemoveAllRls (introspection: any) {
  const removeRlsScript = await computeRemoveRls(introspection)
  await writeRemoveAllRlsPolicy(removeRlsScript)
}

export default generateRemoveAllRls

