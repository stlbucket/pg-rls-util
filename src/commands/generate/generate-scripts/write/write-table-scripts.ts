import { existsSync, mkdirSync, writeFileSync } from 'fs'
import {PgrTableScript, PgrSchemaTableScriptSet, PgrMasterTableScriptSet} from "../../../../d"
import loadConfig from '../../../../config'

async function writeSchemaTableScripts(tableScriptSet: PgrSchemaTableScriptSet): Promise<string> {
  const config = await loadConfig()
  const schemaDir = `${config.artifactsDirectory}/${tableScriptSet.schemaName}`
  const tablesDir = `${schemaDir}/tableScripts`
  const schemaDirExists = await existsSync(schemaDir)
  if (!schemaDirExists) {
    await mkdirSync(schemaDir)
  }
  await mkdirSync(tablesDir)

  const p = tableScriptSet.tableScripts
    .map(
      async(ts: PgrTableScript) => {
        const tableScriptPath = `${tablesDir}/${ts.tableName}.sql`
        const fileContents = `
begin;
\\dp+ ${ts.tableSchema}.${ts.tableName};

${ts.tableScript}

\\dp+ ${ts.tableSchema}.${ts.tableName};
rollback;`
        
        await writeFileSync(tableScriptPath, fileContents)
      }
    )
  await Promise.all(p)

  const fullSchemaScript = tableScriptSet.tableScripts.map(ts => ts.tableScript).join('\n')

  await writeFileSync(`${schemaDir}/all-table-policies---${tableScriptSet.schemaName}.sql`, fullSchemaScript)

  return fullSchemaScript
}

async function writeAllSchemaTableScripts(masterTableScriptSet: PgrMasterTableScriptSet) {
  const config = await loadConfig()

  const p = masterTableScriptSet.schemaTableScriptSets.map(
    async (ss:PgrSchemaTableScriptSet) => {
      const schemaScript = await writeSchemaTableScripts(ss)
      return schemaScript
    }
  )
  const schemaScripts = await Promise.all(p)

  const allTablesScript = schemaScripts.join('\n')
  await writeFileSync(`${config.artifactsDirectory}/all-table-policies---all-schemata.sql`, allTablesScript)
  return allTablesScript
}


export default writeAllSchemaTableScripts
