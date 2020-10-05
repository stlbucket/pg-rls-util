import { writeFileSync, unlinkSync, existsSync } from 'fs'
import {CommandBuilder} from 'yargs'
import loadConfig from '../config'
import { PgrConfig, PgrSchemaFunctionProfileAssignmentSet, PgrSchemaTableProfileAssignmentSet } from '../d'

async function mergeTableSecurity(config: PgrConfig) : Promise<PgrSchemaTableProfileAssignmentSet[]> {
  const currentTableSecurity = config.tableSecurityProfileAssignmentSets
  const removedTableSecurity = config.currentDiff.tableSecurityRemovals
  const addedTableSecurity = config.currentDiff.tableSecurityAdditions

   return currentTableSecurity
   .map(
    current => {
      const removedAssignments: PgrSchemaTableProfileAssignmentSet = removedTableSecurity.find(ts => ts.schemaName === current.schemaName)
      const addedAssignments: PgrSchemaTableProfileAssignmentSet = addedTableSecurity.find(ts => ts.schemaName === current.schemaName)
      if (!removedAssignments) return current
      const removedTables = Object.keys(removedAssignments.tableAssignments)
      const removedViews = Object.keys(removedAssignments.viewAssignments)
      return {
        ...current,
        tableAssignments: {
          ...addedAssignments.tableAssignments,
          ...Object.keys(current.tableAssignments)
          .filter(tableName => removedTables.indexOf(tableName) === -1)
          .reduce(
            (newTa, tableName) => {
              return  {
                ...newTa,
                [tableName]: current.tableAssignments[tableName]
              }
            }, {}
          )
        },
        viewAssignments: {
          ...addedAssignments.viewAssignments,
          ...Object.keys(current.viewAssignments)
          .filter(viewName => removedViews.indexOf(viewName) === -1)
          .reduce(
            (newTa, viewName) => {
              return  {
                ...newTa,
                [viewName]: current.viewAssignments[viewName]
              }
            }, {}
          )
        }
      }
    }
  )
}

async function mergeFunctionSecurity(config: PgrConfig) : Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  const currentFunctionSecurity = config.functionSecurityProfileAssignments
  const removedFunctionSecurity = config.currentDiff.functionSecurityRemovals
  const addedFunctionSecurity = config.currentDiff.functionSecurityAdditions

   return currentFunctionSecurity
   .map(
    current => {
      const removedAssignments: PgrSchemaFunctionProfileAssignmentSet = removedFunctionSecurity.find(ts => ts.schemaName === current.schemaName)
      const addedAssignments: PgrSchemaFunctionProfileAssignmentSet = addedFunctionSecurity.find(ts => ts.schemaName === current.schemaName)
      if (!removedAssignments) return current
      const removedFunctions = Object.keys(removedAssignments.functionAssignments)
      return {
        ...current,
        functionAssignments: {
          ...addedAssignments.functionAssignments,
          ...Object.keys(current.functionAssignments)
          .filter(functionName => removedFunctions.indexOf(functionName) === -1)
          .reduce(
            (newTa, functionName) => {
              return  {
                ...newTa,
                [functionName]: current.functionAssignments[functionName]
              }
            }, {}
          )
        }
      }
    }
  )
}

async function handler(argv) {
  if (argv.connectionString) process.env.PGR_DB_CONNECTION_STRING = argv.connectionString
  if (argv.schemata) process.env.PGR_SCHEMATA = argv.schemata
  const config: PgrConfig = await loadConfig(argv)
  const mergedTableSecurity = await mergeTableSecurity(config)
  const mergedFunctionSecurity = await mergeFunctionSecurity(config)

  await unlinkSync(config.artifactPaths.tableProfileAssignmentsPath)
  await unlinkSync(config.artifactPaths.functionProfileAssignmentsPath)

  await writeFileSync(config.artifactPaths.tableProfileAssignmentsPath, JSON.stringify(mergedTableSecurity, null, 2))
  await writeFileSync(config.artifactPaths.functionProfileAssignmentsPath, JSON.stringify(mergedFunctionSecurity, null, 2))

  const currentDiffExists = await existsSync(config.artifactPaths.currentDiffPath)
  if (currentDiffExists) await unlinkSync(config.artifactPaths.currentDiffPath)

  process.exit()
}


const command = 'merge'
const aliases = 'm'
const describe = 'merge current-diff into table and function assignments, removing and adding entries as appropriate.'
const builder: CommandBuilder = {
  c: { type: 'string', alias: 'connectionString', description: 'a postgres connection string that will define/override PGR_DB_CONNECTION_STRING env variable'},
  s: { type: 'string', alias: 'schemata', description: 'a comma-delimited string of databse schemas to work with'}
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
