import { PgrSchemaTableProfileAssignmentSet, PgrSchema, PgrTable, PgrDbIntrospection, PgrTableSecurityProfileSet } from '../../d'

async function  calcTableProfileAssignments(introspection:PgrDbIntrospection, tableSecurityProfileSet: PgrTableSecurityProfileSet): Promise<PgrSchemaTableProfileAssignmentSet[]> {
  const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const schemaDefaultInitialAssignments = tableSecurityProfileSet.defaultInitialTableAssignments.find(t => t.schemaName === s.schemaName) || {
        schemaName: s.schemaName,
        tableAssignments: {}
      }

      const tableAssignments = s.schemaTables.reduce(
        (a: any, t:PgrTable) => {
          const initialTableProfileName = schemaDefaultInitialAssignments.tableAssignments[t.tableName] || tableSecurityProfileSet.defaultProfileName
          return {
            ...a,
            [t.tableName]: initialTableProfileName
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