import * as Mustache from 'mustache'
import { PgrDbIntrospection, PgrSchema } from '../../../../d';
import loadConfig from '../../../../config'

async function computeOwnershipPolicy (introspection: PgrDbIntrospection) {
  const config = await loadConfig()

  const sortedSchemata = introspection.schemaTree
  .map((s:PgrSchema)=>{
    return {
      ...s,
      schemaFunctions: s.schemaFunctions
      .map(fn=>{
        return {
          ...fn,
          excludeSecurityDefiner: config.generateOptions.functionScripts.disableSecurityDefinerOwnershipGrants ? fn.isSecurityDefiner : false
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
