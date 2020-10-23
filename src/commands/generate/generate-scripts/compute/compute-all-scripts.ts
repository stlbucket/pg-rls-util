import computeAllTableScripts from './compute-table-scripts'
import computeAllFunctionScripts from './compute-function-scripts'
import computeOwnershipPolicy from './compute-ownership-script'
import computeSchemaUsageSql from './compute-schema-usage-sql'
import computeRemoveAllRls from './compute-remove-all-rls-script'
import computeCreateRoles from './compute-create-roles-sql'
import { PgrDbIntrospection, PgrScriptSet } from '../../../../d'

async function computeAllScripts(introspection: PgrDbIntrospection): Promise<PgrScriptSet> {

    const masterTableScriptSetRemoveRls = await computeAllTableScripts(introspection, true)
    const masterTableScriptSet = await computeAllTableScripts(introspection)
    const masterFunctionScriptSet = await computeAllFunctionScripts(introspection)
    const ownershipScript = await computeOwnershipPolicy(introspection)
    const schemaUsageSql = await computeSchemaUsageSql()
    const removeAllRlsScript = await computeRemoveAllRls(introspection)
    const createRolesScript = await computeCreateRoles()

    return {
        masterTableScriptSetRemoveRls: masterTableScriptSetRemoveRls,
        masterTableScriptSet: masterTableScriptSet,
        masterFunctionScriptSet: masterFunctionScriptSet,
        ownershipScript: ownershipScript,
        schemaUsageSql: schemaUsageSql,
        removeAllRlsScript: removeAllRlsScript,
        createRolesScript: createRolesScript
    }
}

export default computeAllScripts
