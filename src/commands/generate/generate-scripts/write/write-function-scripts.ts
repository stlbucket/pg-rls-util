import writeFileToDisk from './write-file-to-disk'
import { existsSync, mkdirSync } from 'fs'
import {PgrFunctionScript, PgrSchemaFunctionScriptSet, PgrMasterFunctionScriptSet} from "../../../../d"
import loadConfig from '../../../../config'


async function writeSchemaFunctionScripts(functionScriptSet: PgrSchemaFunctionScriptSet) {
  const config = await loadConfig()
  const schemaDir = `${config.artifactsDirectory}/${functionScriptSet.schemaName}`
  const functionsDir = `${schemaDir}/functionScripts`
  const schemaDirExists = await existsSync(schemaDir)
  if (!schemaDirExists) {
    await mkdirSync(schemaDir)
  }
  await mkdirSync(functionsDir)

  const p = functionScriptSet.functionScripts
    .map(
      async(ts: PgrFunctionScript) => {
        const functionScriptPath = `${functionsDir}/${ts.functionName}.sql`
        await writeFileToDisk(functionScriptPath, ts.functionScript)
      }
    )
  const scripts = await Promise.all(p)
scripts
  const fullSchemaScript = `
------------------------------
------------------------------ FUNCTION SECURITY GRANTS FOR SCHEMA: ${functionScriptSet.schemaName}
------------------------------
${functionScriptSet.functionScripts.map(fs => fs.functionScript).join('\n')}

`
  await writeFileToDisk(`${schemaDir}/all-function-policies---${functionScriptSet.schemaName}.sql`, fullSchemaScript)

  return fullSchemaScript
}

async function writeAllSchemaFunctionScripts(masterFunctionScriptSet: PgrMasterFunctionScriptSet) {
  const config = await loadConfig()
  const p = masterFunctionScriptSet.schemaFunctionScriptSets.map(
    async (ss:PgrSchemaFunctionScriptSet) => {
      const script = await writeSchemaFunctionScripts(ss)
      return script
    }
  )
  const schemaScripts = await Promise.all(p)
  const allFunctionsScript = schemaScripts.join('\n')
  await writeFileToDisk(`${config.artifactsDirectory}/all-function-policies---all-schemata.sql`, allFunctionsScript)
  return allFunctionsScript
}


export default writeAllSchemaFunctionScripts
