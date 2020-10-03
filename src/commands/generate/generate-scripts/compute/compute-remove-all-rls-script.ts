import * as Mustache from 'mustache'
import { PgrConfig, PgrDbIntrospection, PgrSchema } from '../../../../d'
import loadConfig from '../../../../config'
let config: PgrConfig

async function computeSchemaRemoveRls (schemaName: string): Promise<string> {  
  return Mustache.render(
    config.scriptTemplates.removeAllRlsScriptTemplate,
    { schemaName: schemaName }
  )
}

async function computeRemoveRls (introspection: PgrDbIntrospection): Promise<string> {
  config = await loadConfig()
  const p = introspection.schemaTree.map(
    (s: PgrSchema) => {
      return computeSchemaRemoveRls(s.schemaName)
    }
  )

  const allScripts: string[] = await Promise.all(p)
  return allScripts.join('\n')
}

export default computeRemoveRls
