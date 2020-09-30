import { PgrMasterTableScriptSet } from '../../d'
import computeAllTableScripts from './compute/compute-table-scripts'
// import writeAllSchemaTableScripts from './write/write-table-scripts'

async function generateAllTableScripts(introspection: any): Promise<PgrMasterTableScriptSet> {
  const computedMasterScriptSet = await computeAllTableScripts(introspection)
  // const allTablesScript = await writeAllSchemaTableScripts(computedMasterScriptSet)
  // return allTablesScript
  return computedMasterScriptSet
}

export default generateAllTableScripts