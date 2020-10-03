import { PgrDbIntrospection } from '../../../d'
import computeAllSchemaFunctionScripts from './compute/compute-function-scripts'
import writeAllSchemaFunctionScripts from './write/write-function-scripts'

async function generateAllFunctionScripts(introspection: PgrDbIntrospection) {
  const computedMasterScriptSet = await computeAllSchemaFunctionScripts(introspection)
  await writeAllSchemaFunctionScripts(computedMasterScriptSet)

}

export default generateAllFunctionScripts

