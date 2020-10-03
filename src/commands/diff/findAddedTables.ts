import { PgrConfig, PgrDbIntrospection, PgrSchemaTableProfileAssignmentSet } from '../../d'

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

export default findAddedTables