import Mustache from 'mustache'
import { PgrSchema } from '../../../d'

async function computeSchemaRemoveRls (schemaName: string): Promise<string> {
  return Mustache.render(
    removeAllRlsScriptTemplate,
    { schemaName: schemaName }
  )
}

async function computeRemoveRls (introspection: any): Promise<string> {
  const p = introspection.schemaTree.map(
    (s: PgrSchema) => {
      return computeSchemaRemoveRls(s.schemaName)
    }
  )

  const allScripts: string[] = await Promise.all(p)
  return allScripts.join('\n')
}

export default computeRemoveRls

const removeAllRlsScriptTemplate = `
----------
----------  remove all rls policies for schema: {{schemaName}}
----------
DO
$body$
  DECLARE 
    _pol pg_policies;
    _drop_sql text;
  BEGIN

    for _pol in
      select 
        *
      from pg_policies
      where schemaname = '{{schemaName}}'
    loop
      _drop_sql := 'drop policy if exists ' || _pol.policyname || ' on ' || _pol.schemaname || '.' || _pol.tablename || ';';
      execute _drop_sql;
    end loop
    ;
  END
$body$;
`