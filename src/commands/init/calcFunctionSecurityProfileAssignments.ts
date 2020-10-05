import { PgrConfig, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrSchema, PgrSchemaFunctionProfileAssignmentSet } from '../../d'

async function  calcFunctionSecurityProfileAssignments(introspection: any, functionSecurityProfileSet: PgrFunctionSecurityProfileSet): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  const functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const functionAssignments = s.schemaFunctions.reduce(
        (a: any, f: any) => {
          return {
            ...a,
            [f.functionName]: functionSecurityProfileSet.defaultProfileName
          }
        }, {}
      )
      return {
        schemaName: s.schemaName,
        functionAssignments: functionAssignments
      }
    }
  )
  return functionSecurityProfileAssignments
}

export default calcFunctionSecurityProfileAssignments