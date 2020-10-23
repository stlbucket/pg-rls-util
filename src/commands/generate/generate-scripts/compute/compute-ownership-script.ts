import * as Mustache from 'mustache'
import { PgrDbIntrospection, PgrSchema } from '../../../../d';
import loadConfig from '../../../../config'

async function computeOwnershipPolicy (introspection: PgrDbIntrospection) {
  const config = await loadConfig()

  const DEFAULT = ' DEFAULT'
  const sortedSchemata = introspection.schemaTree
  .map((s:PgrSchema)=>{
    return {
      ...s,
      schemaFunctions: s.schemaFunctions.map(f=>{
        const argumentDataTypes = f.argumentDataTypes
        .split(',')
        .map(adt => adt.replace('timestamp with time zone', 'timestamptz'))
        .map(adt => adt.trim().split(' ').slice(1).join(' '))
        .map(arg => (arg.indexOf(DEFAULT) === -1 ? arg : arg.slice(0, arg.indexOf(DEFAULT))))
        .join(',')

        return {
          ...f,
          argumentDataTypes: argumentDataTypes
        }
      })
    }
  })

  return Mustache.render(
    config.scriptTemplates.ownershipPolicyTemplate,
    {
      schemata: sortedSchemata,
      dbOwnerRole: config.roleSet.dbOwnerRole.roleName
    }
  ).split("&#39;").join("'")
}

export default computeOwnershipPolicy
