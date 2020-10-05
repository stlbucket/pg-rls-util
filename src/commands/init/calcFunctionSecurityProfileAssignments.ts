import { PgrFunctionSecurityProfileSet, PgrSchema, PgrSchemaFunctionProfileAssignmentSet } from '../../d'


// defaultInitialFunctionAssignments
async function  calcFunctionSecurityProfileAssignments(introspection: any, functionSecurityProfileSet: PgrFunctionSecurityProfileSet): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  const functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const schemaDefaultInitialAssignments = functionSecurityProfileSet.defaultInitialFunctionAssignments.find(t => t.schemaName === s.schemaName) || {
        schemaName: s.schemaName,
        functionAssignments: {}
      }

      const functionAssignments = s.schemaFunctions.reduce(
        (a: any, f: any) => {
          const initialFunctionProfileName = schemaDefaultInitialAssignments.functionAssignments[f.functionName] || functionSecurityProfileSet.defaultProfileName
          return {
            ...a,
            [f.functionName]: initialFunctionProfileName
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