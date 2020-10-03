import { PgrConfig, PgrDbIntrospection, PgrSchemaFunctionProfileAssignmentSet } from '../../d'


async function findAddedFunctions(config: PgrConfig, dbIntrospection: PgrDbIntrospection): Promise<PgrSchemaFunctionProfileAssignmentSet[]> {
  return config.functionSecurityProfileAssignments.map(
    (tSet: PgrSchemaFunctionProfileAssignmentSet): PgrSchemaFunctionProfileAssignmentSet => {
      const dbSchema = dbIntrospection.schemaTree.find(s => s.schemaName === tSet.schemaName)
      if (!dbSchema) { return tSet }
      const fromConfigFunctions = Object.keys(tSet.functionAssignments)
      const fromDbFunctions = dbSchema.schemaFunctions.map(t => t.functionName)

      const addedFunctions = fromDbFunctions.filter(t => fromConfigFunctions.indexOf(t) === -1)
      return {
        ...tSet,
        functionAssignments: addedFunctions.reduce(
          (all, t) => {
            return {
              ...all,
              
              [t]: config.functionSecurityProfileSet.defaultProfileName
            }
          }, {}
        )
      }
    }
  )
}

export default findAddedFunctions