import * as Mustache from 'mustache'
import { PgrSchema } from '../../../d';
import loadConfig from '../../../config'

const ownershipPolicyTemplate = `
----------
----------  BEGIN OWNERSHIP SQL
----------
  

{{#schemata}}
----------  SCHEMA: {{schemaName}}
  ALTER SCHEMA {{schemaName}} OWNER TO {{dbOwnerRole}};
  -- tables
  {{#schemaTables}}
    ALTER TABLE {{schemaName}}.{{tableName}} OWNER TO {{dbOwnerRole}};
  {{/schemaTables}}
  -- functions
  {{#schemaFunctions}}
    ALTER FUNCTION {{schemaName}}.{{functionName}}({{argumentDataTypes}}) OWNER TO {{dbOwnerRole}};
  {{/schemaFunctions}}
----------  END SCHEMA: {{schemaName}}
{{/schemata}}
----------
----------  END OWNERSHIP SQL
----------
--==
`

async function computeOwnershipPolicy (introspection: any) {
  const config = await loadConfig()

  const sortedSchemata = introspection.schemaTree
  .map((s:PgrSchema)=>{
    return {
      ...s,
      schemaFunctions: s.schemaFunctions.map(f=>{
        const argumentDataTypes = f.argumentDataTypes
          .split(',')
          .map(adt => adt.replace('timestamp with time zone', 'timestamptz'))
          .map(adt => adt.trim().split(' ')[1])
          .join(', ')

        return {
          ...f,
          argumentDataTypes: argumentDataTypes
        }
      })
    }
  })

  return Mustache.render(
    ownershipPolicyTemplate,
    {
      schemata: sortedSchemata,
      dbOwnerRole: config.roleSet.dbOwnerRole.roleName
    }
  ).split("&#39;").join("'")
}

export default computeOwnershipPolicy