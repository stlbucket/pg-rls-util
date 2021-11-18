import { PgrConfig, PgrDbIntrospection, PgrSchemaTableProfileAssignmentSet } from '../../d'

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

export default findRemovedTables
