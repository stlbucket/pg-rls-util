import loadConfig from '../../../config'
import { PgrTable, PgrTableSecurityProfile, PgrRoleSet, PgrRole, PgrMasterTableScriptSet, PgrSchema, PgrSchemaTableProfileAssignmentSet, PgrSchemaTableScriptSet, PgrTableScript, ColumnExclusionSet, PgrConfig, PgrRoleGrant, PgrTableSecurityProfileSet } from '../../../d'

const Mustache = require('mustache')

const tablePolicyTemplate = `
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

function computeTablePolicy (table: PgrTable, tableSecurityProfile: PgrTableSecurityProfile, roles: PgrRoleSet) {
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:PgrRole) => r.roleName)]

  const rlsPolicies = Object.keys(tableSecurityProfile.policies).reduce(
    (all: any, action: string) => {
      const actionPolicies = tableSecurityProfile.policies[action].map(
        (p:any) => {
          return {
            ...p
            ,roles: p.roles.join(", ")
            ,schemaName: table.schemaName
            ,tableName: table.tableName
          }
        }
      )
      return [...all, ...actionPolicies]
    }, []
  )

  const roleGrants = Object.keys(tableSecurityProfile.grants)
  .reduce(  // reduce to one item per role/action
    (all: any, action: string) => {
      const actionGrants = tableSecurityProfile.grants[action].map(
        (g:any) => {
          return {
            ...g
            ,action: action
            ,schemaName: table.schemaName
            ,tableName: table.tableName
          }
        }
      )
      return [...all, ...actionGrants]
    }, []
  )
  .reduce(  // reduce to one role with multiple actions
    (all: any, roleGrant: any) => {
      const finalGrant = all.find((g:any) => g.roleName === roleGrant.roleName) || {...roleGrant, grants: []}
      const otherGrants = all.filter((g:any) => g.roleName !== roleGrant.roleName)
      const exclusions = roleGrant.exclusions || []
      const grantColumns = (['INSERT','UPDATE'].indexOf(roleGrant.action) > -1 ? table.tableColumns : [])
        .map((tc:any) => tc.column_name)
        .filter((c:string) => exclusions.indexOf(c) === -1)
      const grantColumnsText = grantColumns.length > 0 ? `(${grantColumns.join(', ')})` : null
      const columnExclusionsText = exclusions.length > 0 ? `\n       --  excluded columns for ${roleGrant.action}: ${exclusions.join(', ')}` : null 

      return [...otherGrants, {
        ...finalGrant, 
        grants: [...finalGrant.grants.map((og:any) => { return {...og, comma: ','}}), {action: roleGrant.action, grantColumns: grantColumnsText, columnExclusionsText: columnExclusionsText}]
      }]
    }, []
  )

  const templateVariables = {
    enableRls: tableSecurityProfile.enableRls,
    schemaName: table.schemaName,
    tableName: table.tableName,
    tableSecurityProfileName: tableSecurityProfile.name,
    revokeRolesList: revokeRolesList.join(',\n       '),
    grantRolesList: roles.dbUserRoles.map((r:any) => r.roleName).join(",\n"),
    rlsPolicies: rlsPolicies,
    roleGrants: roleGrants
  }

  return Mustache.render(
    tablePolicyTemplate,
    templateVariables
  )

}

async function computeSchemaTableScripts(schemaTableAssignmentSet: PgrSchemaTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: any):  Promise<PgrSchemaTableScriptSet>{
  const p = Object.keys(schemaTableAssignmentSet.tableAssignments)
  // const p = ['contact']
    .map(
      async (tableName: string): Promise<PgrTableScript> => {
        const table = introspection.schemaTree
          .find((s: PgrSchema) => s.schemaName === schemaTableAssignmentSet.schemaName).schemaTables
          .find((t: PgrTable) => t.tableName === tableName)
        const securityProfile = securityProfiles.find((sp: PgrTableSecurityProfile) => sp.name === schemaTableAssignmentSet.tableAssignments[tableName])
        if (!securityProfile) throw new Error(`No securityProfile: ${schemaTableAssignmentSet.tableAssignments[tableName]}`)
        const tableScript = await computeTablePolicy(table, securityProfile, roles)
        return {
          tableSchema: schemaTableAssignmentSet.schemaName,
          tableName: tableName,
          tableScript: tableScript
        }
      }
    )
  const tableScripts: PgrTableScript[] = await Promise.all(p)

  const allInOneScript = tableScripts.map(ts => ts.tableScript).join('\n')
  return {
    schemaName: schemaTableAssignmentSet.schemaName,
    allTablesInOneScript: allInOneScript,
    tableScripts: tableScripts
  }
}

async function computeAllSchemaTableScripts(tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[], mappedSecurityProfiles: PgrTableSecurityProfile[], roleSet: PgrRoleSet, introspection: any): Promise<PgrMasterTableScriptSet> {
  const p = tableSecurityProfileAssignments
  // .filter(s => s.schemaName === 'soro')
  .map(
    async (schemaAssignments: PgrSchemaTableProfileAssignmentSet) => {      
      const schemaTableScriptSet = await computeSchemaTableScripts(schemaAssignments, mappedSecurityProfiles, roleSet, introspection)
      return schemaTableScriptSet
    }
  );

  const schemaTableScriptSets = await Promise.all(p)
  const allInOneScript = schemaTableScriptSets.map(tss => tss.allTablesInOneScript).join('\n')
  return {
    allTablesInOneScript: allInOneScript,
    schemaTableScriptSets: schemaTableScriptSets
  }
}

function mapSecurityProfile(
  securityProfile: PgrTableSecurityProfile, 
  defaultInsertExclusions: ColumnExclusionSet, 
  defaultUpdateExclusions: ColumnExclusionSet
) {
  // here we are calculating the column exclusions for insert and update ops
  return {
    ...securityProfile,
    grants: {
      ...securityProfile.grants,
      INSERT: securityProfile.grants.INSERT.map(
        (grant: PgrRoleGrant) => {
          return {
            ...grant,
            exclusions: grant.exclusions || defaultInsertExclusions || []
          }
        }
      ),
      UPDATE: securityProfile.grants.UPDATE.map(
        (grant: PgrRoleGrant) => {
          return {
            ...grant,
            exclusions: grant.exclusions || defaultUpdateExclusions || []
          }
        }
      )
    }
  }
}

async function computeAllTableScripts(introspection: any): Promise<PgrMasterTableScriptSet>{
  const config: PgrConfig = await loadConfig()

  const tableSecurityProfileSet: PgrTableSecurityProfileSet = config.tableSecurityProfileSet

  const mappedSecurityProfiles: PgrTableSecurityProfile[] = tableSecurityProfileSet.tableSecurityProfiles.map(
    (p: PgrTableSecurityProfile) => {
      return mapSecurityProfile(p, tableSecurityProfileSet.defaultInsertExclusions, tableSecurityProfileSet.defaultUpdateExclusions)
    }
  )

  const computedMasterScriptSet = await computeAllSchemaTableScripts(config.tableSecurityProfileAssignments,mappedSecurityProfiles,config.roleSet,introspection)

  return computedMasterScriptSet
}

export default computeAllTableScripts
