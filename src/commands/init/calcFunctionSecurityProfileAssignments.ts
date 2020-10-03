import defaultFunctionSecurityProfiles from '../../default/default-function-security-profiles'
import { PgrSchema, PgrSchemaFunctionProfileAssignmentSet } from '../../d'

async function  calcFunctionSecurityProfileAssignments(introspection: any): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  const functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const functionAssignments = s.schemaFunctions.reduce(
        (a: any, f: any) => {
          return {
            ...a,
            [f.functionName]: defaultFunctionSecurityProfiles.defaultProfileName
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