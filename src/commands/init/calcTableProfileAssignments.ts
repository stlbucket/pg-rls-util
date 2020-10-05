import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrDbIntrospection, PgrConfig, PgrTableSecurityProfileSet } from '../../d'

async function  calcTableProfileAssignments(introspection:PgrDbIntrospection, tableSecurityProfileSet: PgrTableSecurityProfileSet): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const tableAssignments = s.schemaTables.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: tableSecurityProfileSet.defaultProfileName
          }
        }, {}
      )
      const viewAssignments = s.schemaViews.reduce(
        (a: any, t:PgrTable) => {
          return {
            ...a,
            [t.tableName]: tableSecurityProfileSet.defaultProfileName
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