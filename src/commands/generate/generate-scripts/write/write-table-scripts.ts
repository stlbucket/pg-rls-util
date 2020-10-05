import * as Mustache from 'mustache'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import {PgrTableScript, PgrSchemaTableScriptSet, PgrMasterTableScriptSet} from "../../../../d"
import loadConfig from '../../../../config'
import { getConnectionInfo } from '../../../../pg-client'

const tableFullSqlTemplate = `
-- to run this sql:
--                       
-- psql -h {{{dbHost}}} -U {{{dbUser}}} -d {{dbName}} -f {{{tableScriptPath}}}

-- this script is meant to used during development                    ----------------------
-- to give a quick view of the before and after state for table:      {{ts.tableSchema}}.{{ts.tableName}}
begin;
\\echo
\\echo ........
\\echo ....DETAILED TABLE INFORMATION
\\echo ........
\\d+ {{ts.tableSchema}}.{{ts.tableName}}
\\echo
\\echo ........
\\echo ....SECURITY BEFORE SCRIPT EXECUTES
\\echo ........
\\dp+ {{ts.tableSchema}}.{{ts.tableName}}

{{#includeRemoveRls}}
\\echo
\\echo ........
\\echo ....TEMPORARILY REMOVE ANY EXISTING RLS SECURITY
\\echo ....this section NOT included in scripts meant for deployment - only here
\\echo ....this setting can be controlled by table-security-profiles.includeTableRlsRemoval settinc
\\echo ........
{{{ts.tableRemoveRlsScript}}}
{{/includeRemoveRls}}
{{^includeRemoveRls}}
\\echo
\\echo ........
\\echo ....LEAVING ANY EXISTING RLS INTACT
\\echo ....this setting can be controlled by table-security-profiles.includeTableRlsRemoval settinc
\\echo ........
{{/includeRemoveRls}}

\\echo
\\echo ........
\\echo ....now executing actual table script
\\echo ........
{{ts.tableScript}}

\\echo
\\echo ........
\\echo ....SECURITY AFTER SCRIPT EXECUTES
\\echo ........
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
            tableScriptPath: tableScriptPath,
            includeRemoveRls: config.tableSecurityProfileSet.includeTableRlsRemoval
          }
        )
        await writeFileSync(tableScriptPath, fileContents.split('&#x3D;').join('='))
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
