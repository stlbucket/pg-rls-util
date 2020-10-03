import { PgrConfig, PgrDbIntrospection, PgrSchemaFunctionProfileAssignmentSet } from '../../d'

async function findRemovedFunctions(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  return config.functionSecurityProfileAssignments.map(
    (tSet: PgrSchemaFunctionProfileAssignmentSet): PgrSchemaFunctionProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigFunctions = Object.keys(tSet.functionAssignments)
      const fromDbFunctions = dbSchema.schemaFunctions.map(t => t.functionName)

      const removedFunctions = fromConfigFunctions.filter(t => fromDbFunctions.indexOf(t) === -1)
      
      return {
        ...tSet,
        functionAssignments: removedFunctions.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: tSet.functionAssignments[t]
            }
          }, {}
        )
      }
    }
  )
}

export default findRemovedFunctions