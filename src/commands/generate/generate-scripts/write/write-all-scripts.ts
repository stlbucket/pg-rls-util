import {writeFileSync} from 'fs'
import loadConfig from '../../../../config'
import writeDirectories from './write-directories'
import writeAllTableScripts from './write-table-scripts'
import writeAllFunctionScripts from './write-function-scripts'
import { PgrScriptSet } from '../../../../d'

async function writeAllScripts(scriptSet: PgrScriptSet) {
    const config = await loadConfig()
    // // @ts-ignore
    await writeDirectories(scriptSet)

    const allTablesScript = await writeAllTableScripts(scriptSet.masterTableScriptSet)
    const allFunctionsScript = await writeAllFunctionScripts(scriptSet.masterFunctionScriptSet)
    console.log(config.generateOptions)
    const oneScriptToRuleThemAll = `
---------**************  REMOVE EXISTING RLS
${config.generateOptions.masterScript.includeRemoveRls ? scriptSet.removeAllRlsScript : `------ ***** EXISTING RLS POLICIES NOT AFFECTED`}
---------**************  REMOVE EXISTING RLS -- END OF SECTION

---------**************  OWNERSHIP
${config.generateOptions.masterScript.includeOwnership ? scriptSet.ownershipScript : `------ ***** EXISTING OWNERSHIP NOT AFFECTED`}
---------**************  OWNERSHIP -- END OF SECTION

---------**************  SCHEMA USAGE
${config.generateOptions.masterScript.includeSchemaUsage ? scriptSet.schemaUsageSql : `------ ***** EXISTING OWNERSHIP NOT AFFECTED`}
---------**************  END SCHEMA USAGE -- END OF SECTION

${allTablesScript}

${allFunctionsScript}
`
    await writeFileSync(config.artifactPaths.ownershipPath, scriptSet.ownershipScript)
    await writeFileSync(config.artifactPaths.removeAllRlsPath, scriptSet.removeAllRlsScript)
    await writeFileSync(config.artifactPaths.createRolesPath, scriptSet.createRolesScript)
    await writeFileSync(config.artifactPaths.schemaUsageSqlPath, scriptSet.schemaUsageSql)

    await writeFileSync(config.artifactPaths.oneScriptToRuleThemAllPath, oneScriptToRuleThemAll)
}

export default writeAllScripts
