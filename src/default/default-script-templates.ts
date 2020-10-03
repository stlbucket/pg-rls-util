
import {PgrScriptTemplateSet} from '../d'


const scriptTemplates: PgrScriptTemplateSet = {
  functionPolicyTemplate: `
----------
----------  BEGIN FUNCTION POLICY: {{schemaName}}.{{functionName}}
----------  POLICY NAME:  {{policyName}}
----------

----------  REMOVE EXISTING FUNCTION GRANTS
  revoke all privileges on function {{functionSignature}} from {{revokeRolesList}};

{{#roleGrant}}
----------  CREATE NEW FUNCTION GRANTS
----------  {{roles}}
  grant execute on function {{functionSignature}} to {{roles}};  
{{/roleGrant}}
----------  END FUNCTION POLICY: {{schemaName}}.{{functionName}}
--==
`,
  ownershipPolicyTemplate: `
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
`,
  removeAllRlsScriptTemplate: `
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
`,
  schemaUsageSqlTemplate: `
----------
----------  BEGIN SCHEMA USAGE SQL
----------

REVOKE USAGE ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO {{dbAuthenticatorRole}};

{{#schemata}}
------- {{schemaName}}
  REVOKE USAGE ON SCHEMA {{schemaName}} FROM {{revokeRolesList}};

  {{#showGrants}}
  GRANT USAGE ON SCHEMA {{schemaName}} TO {{grantRolesList}};
  {{/showGrants}}
{{/schemata}}
----------
----------  END SCHEMA USAGE SQL
----------
--==
`,
  tablePolicyTemplate: `
----******
----******  BEGIN TABLE POLICY: {{schemaName}}.{{tableName}}
----******  TABLE SECURITY PROFILE:  {{tableSecurityProfileName}}
----******
----------  REMOVE EXISTING TABLE GRANTS
  revoke all privileges on table {{schemaName}}.{{tableName}} 
  from {{revokeRolesList}}
  ;

----------  REMOVE EXISTING RLS POLICIES
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
      and tablename = '{{tableName}}'
    loop
      _drop_sql := 'drop policy if exists ' || _pol.policyname || ' on ' || _pol.schemaname || '.' || _pol.tablename || ';';
      execute _drop_sql;
    end loop
    ;
  END
$body$;


{{#enableRls}}
----------  ENABLE ROW LEVEL SECURITY: {{schemaName}}.{{tableName}}
  alter table {{schemaName}}.{{tableName}} enable row level security;

{{#rlsPolicies}}
  drop policy if exists {{policyname}} on {{schemaName}}.{{tableName}};
  create policy {{policyname}} on {{schemaName}}.{{tableName}} as {{permissive}} for {{cmd}} to {{roles}}{{#qual}} using ({{qual}}){{/qual}}{{#with_check}} with check ({{with_check}}){{/with_check}};
{{/rlsPolicies}}
{{/enableRls}}
{{^enableRls}}
----------  DISABLE ROW LEVEL SECURITY: {{schemaName}}.{{tableName}}
  alter table {{schemaName}}.{{tableName}} disable row level security;
{{/enableRls}}

----------  CREATE NEW TABLE GRANTS: {{schemaName}}.{{tableName}}
{{#roleGrants}}

----------  {{roleName}}
  grant 
  {{#grants}}
    {{action}} {{grantColumns}}{{comma}} {{columnExclusionsText}}
  {{/grants}}
  on table {{schemaName}}.{{tableName}} to {{roleName}};

{{/roleGrants}}

----======  END TABLE POLICY: {{schemaName}}.{{tableName}}
--==
  `
}

export default scriptTemplates