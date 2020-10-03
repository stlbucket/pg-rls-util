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
    const oneScriptToRuleThemAll = `
${allTablesScript}

${allFunctionsScript}
`
    await writeFileSync(config.artifactPaths.ownershipPath, scriptSet.ownershipScript)
    await writeFileSync(config.artifactPaths.removeAllRlsPath, scriptSet.removeAllRlsScript)
    await writeFileSync(config.artifactPaths.createRolesPath, scriptSet.createRolesScript)

    await writeFileSync(config.artifactPaths.oneScriptToRuleThemAllPath, oneScriptToRuleThemAll)
}

export default writeAllScripts