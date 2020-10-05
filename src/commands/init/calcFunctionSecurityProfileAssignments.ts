import { PgrConfig, PgrSchema, PgrSchemaFunctionProfileAssignmentSet } from '../../d'
import loadConfig from '../../config'
let config: PgrConfig

async function  calcFunctionSecurityProfileAssignments(introspection: any): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  config = await loadConfig()
  const functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[] = introspection.schemaTree.map(
    (s: PgrSchema) => {
      const functionAssignments = s.schemaFunctions.reduce(
        (a: any, f: any) => {
          return {
            ...a,
            [f.functionName]: config.functionSecurityProfileSet.defaultProfileName
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