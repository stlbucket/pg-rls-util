import {CommandBuilder} from 'yargs'
// import {mkdirSync, existsSync, readdirSync} from 'fs'
import loadConfig from '../config'
import { PgrConfig, PgrDbIntrospection, PgrDiffSummary, PgrSchemaFunctionProfileAssignmentSet, PgrSchemaTableProfileAssignmentSet } from '../d'
import {introspectDb} from '../fn/introspect-db'
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// const baseDir = `${process.cwd()}/.pgrlsgen`
// const currentDraftDir = `${baseDir}/current-draft`
// const releasesDir = `${baseDir}/releases`

async function findRemovedTables(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  return config.tableSecurityProfileAssignmentSets.map(
    (tSet: PgrSchemaTableProfileAssignmentSet): PgrSchemaTableProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigTables = Object.keys(tSet.tableAssignments)
      const fromConfigViews = Object.keys(tSet.viewAssignments)
      const fromDbTables = dbSchema.schemaTables.map(t => t.tableName)
      const fromDbViews = dbSchema.schemaViews.map(t => t.tableName)

      const removedTables = fromConfigTables.filter(t => fromDbTables.indexOf(t) === -1)
      const removedViews = fromConfigViews.filter(t => fromDbViews.indexOf(t) === -1)
      
      return {
        ...tSet,
        viewAssignments: removedViews.reduce(
          (all, v) => {
            return {
              ...all,
              
              [v]: tSet.viewAssignments[v]
            }
          }, {}
        ),
        tableAssignments: removedTables.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: tSet.tableAssignments[t]
            }
          }, {}
        )
      }
    }
  )
}

async function findAddedTables(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  return config.tableSecurityProfileAssignmentSets.map(
    (tSet: PgrSchemaTableProfileAssignmentSet): PgrSchemaTableProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigTables = Object.keys(tSet.tableAssignments)
      const fromDbTables = dbSchema.schemaTables.map(t => t.tableName)
      const addedTables = fromDbTables.filter(t => fromConfigTables.indexOf(t) === -1)

      const fromConfigViews = Object.keys(tSet.viewAssignments)
      const fromDbViews = dbSchema.schemaViews.map(t => t.tableName)
      const addedViews = fromDbViews.filter(t => fromConfigViews.indexOf(t) === -1)

      return {
        ...tSet,
        viewAssignments: addedViews.reduce(
          (all, v) => {
            return {
              ...all,
              
              [v]: tSet.viewAssignments[v]
            }
          }, {}
        ),
        tableAssignments: addedTables.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: config.tableSecurityProfileSet.defaultProfileName
            }
          }, {}
        )
      }
    }
  )
}


async function findRemovedFunctions(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  return config.functionSecurityProfileAssignments.map(
    (tSet: PgrSchemaFunctionProfileAssignmentSet): PgrSchemaFunctionProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigFunctions = Object.keys(tSet.functionAssignments)
      const fromDbFunctions = dbSchema.schemaFunctions.map(t => t.functionName)

      const removedFunctions = fromConfigFunctions.filter(t => fromDbFunctions.indexOf(t) === -1)
      
      return {
        ...tSet,
        functionAssignments: removedFunctions.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: tSet.functionAssignments[t]
            }
          }, {}
        )
      }
    }
  )
}

async function findAddedFunctions(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  return config.functionSecurityProfileAssignments.map(
    (tSet: PgrSchemaFunctionProfileAssignmentSet): PgrSchemaFunctionProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigFunctions = Object.keys(tSet.functionAssignments)
      const fromDbFunctions = dbSchema.schemaFunctions.map(t => t.functionName)

      const addedFunctions = fromDbFunctions.filter(t => fromConfigFunctions.indexOf(t) === -1)
      return {
        ...tSet,
        functionAssignments: addedFunctions.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: config.functionSecurityProfileSet.defaultProfileName
            }
          }, {}
        )
      }
    }
  )
}

async function handler() {
  const config: PgrConfig = await loadConfig()
  const dbIntrospection = await introspectDb()

  // const configSchemata = config.tableSecurityProfileAssignmentSets.map(tspa => tspa.schemaName)
  // const dbIntrospectionSchemata = dbIntrospection.schemaTree.map(s => s.schemaName)

  const removedTableSecurityProfileAssignmentSets = await findRemovedTables(config, dbIntrospection)
  const addedTableSecurityProfileAssignmentSets = await findAddedTables(config, dbIntrospection)
  const removedFunctionSecurityProfileAssignmentSets = await findRemovedFunctions(config, dbIntrospection)
  const addedFunctionSecurityProfileAssignmentSets = await findAddedFunctions(config, dbIntrospection)

  const summary: PgrDiffSummary = {
    removedTableSecurityProfileAssignmentSets: removedTableSecurityProfileAssignmentSets,
    addedTableSecurityProfileAssignmentSets: addedTableSecurityProfileAssignmentSets,
    removedFunctionSecurityProfileAssignmentSets: removedFunctionSecurityProfileAssignmentSets,
    addedFunctionSecurityProfileAssignmentSets: addedFunctionSecurityProfileAssignmentSets
  }

  console.log('summary', JSON.stringify(summary,null,2))
  // reduce to find new tables, views, functions with default policies
  // tables


  // reduce to find dropped tables, views, function
  // write diff json file
    
  process.exit()
}


const command = 'diff'
const aliases = 'd'
const describe = 'examine differences between current draft assignments and db introspection'
const builder: CommandBuilder = {
}
const deprecated = false

export default {command, aliases, describe, builder, handler, deprecated}
