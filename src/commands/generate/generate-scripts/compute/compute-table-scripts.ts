import loadConfig from '../../../../config'
import { PgrTable, PgrTableSecurityProfile, PgrRoleSet, PgrRole, PgrMasterTableScriptSet, PgrSchema, PgrSchemaTableProfileAssignmentSet, PgrSchemaTableScriptSet, PgrTableScript, ColumnExclusionSet, PgrConfig, PgrRoleGrant, PgrTableSecurityProfileSet, PgrDbIntrospection } from '../../../../d'

import * as Mustache from 'mustache'
import computeTablePolicy from './compute-table-policy'
let config: PgrConfig

function computeTableRemoveRls (table: PgrTable): string {

  const templateVariables = {
    schemaName: table.schemaName,
    tableName: table.tableName
  }

  return Mustache.render(
    config.scriptTemplates.dropExistingRlsPoliciesTemplate,
    templateVariables
  )
}

async function computeSchemaTableScripts(schemaTableAssignmentSet: PgrSchemaTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: PgrDbIntrospection, dropExistingRls = false):  Promise<PgrSchemaTableScriptSet>{
  const p = Object.keys(schemaTableAssignmentSet.tableAssignments)
  .filter(t => t === 'users')
    .map(
      async (tableName: string): Promise<PgrTableScript> => {
        const table = introspection.schemaTree
          .find((s: PgrSchema) => s.schemaName === schemaTableAssignmentSet.schemaName).schemaTables
          .find((t: PgrTable) => t.tableName === tableName)
        const securityProfile = securityProfiles.find((sp: PgrTableSecurityProfile) => sp.name === schemaTableAssignmentSet.tableAssignments[tableName])
        if (!securityProfile) throw new Error(`No securityProfile: ${schemaTableAssignmentSet.tableAssignments[tableName]}`)
        if (!table) throw new Error(`No table exists: ${tableName}`)
        const tableScript = await computeTablePolicy(table, securityProfile, roles, dropExistingRls)
        const removeRlsScript = await computeTableRemoveRls(table)

        return {
          tableSchema: schemaTableAssignmentSet.schemaName,
          tableName: tableName,
          tableScript: tableScript,
          tableRemoveRlsScript: removeRlsScript          
        }
      }
    )
  const tableScripts: PgrTableScript[] = await Promise.all(p)

  return {
    schemaName: schemaTableAssignmentSet.schemaName,
    tableScripts: tableScripts
  }
}

async function computeAllSchemaTableScripts(tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[], mappedSecurityProfiles: PgrTableSecurityProfile[], roleSet: PgrRoleSet, introspection: PgrDbIntrospection, dropExistingRls = false): Promise<PgrMasterTableScriptSet> {
  const p = tableSecurityProfileAssignments
  .map(
    async (schemaAssignments: PgrSchemaTableProfileAssignmentSet) => {      
      const schemaTableScriptSet = await computeSchemaTableScripts(schemaAssignments, mappedSecurityProfiles, roleSet, introspection, dropExistingRls)
      return schemaTableScriptSet
    }
  );

  const schemaTableScriptSets = await Promise.all(p)
  return {
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

async function computeAllTableScripts(introspection: PgrDbIntrospection, dropExistingRls = false): Promise<PgrMasterTableScriptSet>{
  config = await loadConfig()
  const tableSecurityProfileSet: PgrTableSecurityProfileSet = config.tableSecurityProfileSet

  const mappedSecurityProfiles: PgrTableSecurityProfile[] = tableSecurityProfileSet.tableSecurityProfiles.map(
    (p: PgrTableSecurityProfile) => {
      return mapSecurityProfile(p, tableSecurityProfileSet.defaultInsertExclusions, tableSecurityProfileSet.defaultUpdateExclusions)
    }
  )

  const computedMasterScriptSet = await computeAllSchemaTableScripts(config.tableSecurityProfileAssignmentSets,mappedSecurityProfiles,config.roleSet,introspection, dropExistingRls)

  return computedMasterScriptSet
}

export default computeAllTableScripts
