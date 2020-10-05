import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrDbIntrospection, PgrConfig } from '../../d'
import loadConfig from '../../config'
let config: PgrConfig

async function  calcTableProfileAssignments(introspection:PgrDbIntrospection): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  config = await loadConfig()
  const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const tableAssignments = s.schemaTables.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: config.tableSecurityProfileSet.defaultProfileName
          }
        }, {}
      )
      const viewAssignments = s.schemaViews.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: config.tableSecurityProfileSet.defaultProfileName
          }
        }, {}
      )
      return {
        schemaName: s.schemaName,
        tableAssignments: tableAssignments,
        viewAssignments: viewAssignments
      }
    }
  )
  return tableProfileAssignments

}

export default calcTableProfileAssignments