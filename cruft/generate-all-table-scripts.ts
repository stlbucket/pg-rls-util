import { PgrDbIntrospection, PgrMasterTableScriptSet } from '../../../d'
import computeAllTableScripts from './compute/compute-table-scripts'

async function generateAllTableScripts(introspection: PgrDbIntrospection): Promise<PgrMasterTableScriptSet> {
  const computedMasterScriptSet = await computeAllTableScripts(introspection)
  return computedMasterScriptSet
}

export default generateAllTableScripts