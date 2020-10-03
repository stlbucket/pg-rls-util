import { PgrDbIntrospection } from '../../../d'
import computeAllScripts from './compute/compute-all-scripts'
import writeAllScripts from './write/write-all-scripts'
// import generateAllTableScripts from './generate-all-table-scripts'
// import generateAllFunctionScripts from './generate-all-function-scripts'
// import generateOwnershipPolicy from './generate-ownership-policy'
// import generateRemoveAllRls from './generate-remove-all-rls'
// import generateCreateRolesSql from './generate-create-roles-sql'
// import generateSchemaUsageSql from './generate-schema-usage-sql'

async function generateAllScripts(introspection: PgrDbIntrospection) {
    const allScripts = await computeAllScripts(introspection)
    await writeAllScripts(allScripts)
    // const allTablesScript = await generateAllTableScripts(introspection)
    // const allFunctionsScript = await generateAllFunctionScripts(introspection)
    // await generateOwnershipPolicy(introspection)
    // await generateRemoveAllRls(introspection)
    // await generateCreateRolesSql()
    // await generateSchemaUsageSql()

    
}

export default generateAllScripts