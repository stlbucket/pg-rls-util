import {writeFileSync} from 'fs'
import loadConfig from '../../../config'
import writeDirectories from './write-directories'
import writeAllTableScripts from './write-table-scripts'
import writeAllFunctionScripts from './write-function-scripts'
import writeOwnershipPolicy from './write-ownership-policy'
import writeRemoveAllRls from './write-remove-all-rls'
import { PgrScriptSet } from '../../../d'

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
    await writeOwnershipPolicy(scriptSet.ownershipScript)
    await writeRemoveAllRls(scriptSet.removeAllRlsScript)

    await writeFileSync(`${config.artifactsDirectory}/one-script-to-rule-them-all.sql`, oneScriptToRuleThemAll)
}

export default writeAllScripts