
async function buildQuery(schemas: string) {
  try {
    const querySql = `
    SELECT 
      (
        select coalesce((array_to_json(array_agg(row_to_json(er))))::jsonb, '[]')
        from (
          select
            er.*
            ,(
              select coalesce((array_to_json(array_agg(row_to_json(ar))))::jsonb, '[]')
              from (
                select
                  ar.*
                from information_schema.applicable_roles ar
                where ar.grantee = er.role_name
              ) ar
            ) applicable_roles
          from information_schema.enabled_roles er
        ) er
      ) enabled_roles
      ,(
        select coalesce((array_to_json(array_agg(row_to_json(rls))))::jsonb, '[]')
        from (
          select
          *
        from pg_catalog.pg_policies p
        ) rls
      ) rls_policies
      ,(
        select coalesce((array_to_json(array_agg(row_to_json(s))))::jsonb, '[]'::jsonb)
        FROM (
          select 
            s.*
            ,'schema' __typename
            ,s.schema_name id
            ,(
              select coalesce((array_to_json(array_agg(row_to_json(t))))::jsonb, '[]')
              from (
                select
                  t.*
                  ,'table' __typename
                  ,s.schema_name || '.' || t.table_name id
                  ,(select relrowsecurity from pg_catalog.pg_class where relnamespace = (select oid from pg_catalog.pg_namespace where nspname = s.schema_name) and relname = t.table_name) rls_enabled
                  ,(
                    select (array_to_json(array_agg(row_to_json(c))))::jsonb
                    from (
                      select
                        c.*
                        ,'column' __typename
                        ,s.schema_name || '.' || t.table_name || '.' || c.column_name id
                      from information_schema.columns c
                      where c.table_schema = t.table_schema
                      and c.table_name = t.table_name
                    ) c
                  ) table_columns
                  ,(
                    select coalesce((array_to_json(array_agg(row_to_json(p))))::jsonb, '[]'::jsonb)
                    from (
                      select
                        *
                      from pg_catalog.pg_policies p
                      where p.schemaname = t.table_schema
                      and p.tablename = t.table_name
                    ) p
                  ) policies
                  ,(
                    select coalesce((array_to_json(array_agg(row_to_json(rtg))))::jsonb, '[]'::jsonb)
                    from (
                      select
                        rtg.*
                      from information_schema.role_table_grants rtg
                      where rtg.table_schema = t.table_schema
                      and rtg.table_name = t.table_name
                    ) rtg
                  ) role_table_grants
                from information_schema.tables t
                where t.table_schema = s.schema_name
                and t.table_type = 'BASE TABLE'
                order by t.table_name
              ) t
            ) schema_tables
            ,(
              select coalesce((array_to_json(array_agg(row_to_json(t))))::jsonb, '[]')
              from (
                select
                  t.*
                  ,'table' __typename
                  ,s.schema_name || '.' || t.table_name id
                  ,(
                    select coalesce((array_to_json(array_agg(row_to_json(rtg))))::jsonb, '[]'::jsonb)
                    from (
                      select
                        rtg.*
                      from information_schema.role_table_grants rtg
                      where rtg.table_schema = t.table_schema
                      and rtg.table_name = t.table_name
                    ) rtg
                  ) role_table_grants
                from information_schema.tables t
                where t.table_schema = s.schema_name
                and t.table_type = 'VIEW'
                order by t.table_name
              ) t
            ) schema_views
            ,(
              select coalesce((array_to_json(array_agg(row_to_json(sf))))::jsonb, '[]'::jsonb)
              from (
                select
                  'function' __typename
                  ,n.nspname || '.' ||  p.proname || '_' || p.oid id
                  ,p.proname "functionName"
                  ,n.nspname "functionSchema"
                  ,coalesce(pg_catalog.pg_get_function_result(p.oid), 'N/A') "resultDataType"
                  ,coalesce(pg_catalog.pg_get_function_arguments(p.oid), 'N/A') "argumentDataTypes"
                  ,coalesce(pg_catalog.pg_get_functiondef(p.oid)::text, 'N/A') "definition"
                  from pg_catalog.pg_proc p
                  left join pg_catalog.pg_namespace n ON n.oid = p.pronamespace
                  where n.nspname = s.schema_name
                  and p.prokind in ('f')
                  order by p.proname
              ) sf
            ) schema_functions
          from information_schema.schemata s
          where schema_name in ('${schemas.split(',').map(s=>s.trim()).join("','")}')
        ) s
      ) schema_tree
  ;
      `
      return querySql;

  } catch (e) {
    console.log('CAUGHT ERROR', e.toString())
    throw e;
  }
}

export default buildQuery