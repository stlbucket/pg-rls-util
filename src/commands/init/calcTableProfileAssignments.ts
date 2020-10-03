import defaultTableSecurityProfiles from '../../default/default-table-security-profiles'
import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrDbIntrospection } from '../../d'

async function  calcTableProfileAssignments(introspection:PgrDbIntrospection): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const tableAssignments = s.schemaTables.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
          }
        }, {}
      )
      const viewAssignments = s.schemaViews.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
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