import * as Mustache from 'mustache'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import {PgrTableScript, PgrSchemaTableScriptSet, PgrMasterTableScriptSet} from "../../../../d"
import loadConfig from '../../../../config'
import { getConnectionInfo } from '../../../../pg-client'

const tableFullSqlTemplate = `
-- to run this sql:
--                       psql -h {{{dbHost}}} -U {{{dbUser}}} -d {{dbName}} -f {{{tableScriptPath}}}

-- this script is meant to give a quick view of the before and after state for table:  {{ts.schemaName}}.{{ts.tableName}}
begin;
\\dp+ {{ts.tableSchema}}.{{ts.tableName}};

{{{ts.tableRemoveRlsScript}}}

{{ts.tableScript}}

\\dp+ {{ts.tableSchema}}.{{ts.tableName}};
rollback;
`

async function writeSchemaTableScripts(tableScriptSet: PgrSchemaTableScriptSet): Promise<string> {
  const config = await loadConfig()
  const connectionInfo = await getConnectionInfo()
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
        const fileContents = Mustache.render(
          tableFullSqlTemplate,
          {
            ts: ts,
            dbHost: connectionInfo.dbHost,
            dbUser: connectionInfo.dbUser,
            dbName: connectionInfo.dbName,
            tableScriptPath: tableScriptPath
          }
        )
        
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
