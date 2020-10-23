import loadConfig from '../../../../config'
import { PgrTable, PgrTableSecurityProfile, PgrRoleSet, PgrRole, PgrMasterTableScriptSet, PgrSchema, PgrSchemaTableProfileAssignmentSet, PgrSchemaTableScriptSet, PgrTableScript, ColumnExclusionSet, PgrConfig, PgrRoleGrant, PgrTableSecurityProfileSet, PgrDbIntrospection } from '../../../../d'

import * as Mustache from 'mustache'
import computeTablePolicy from './compute-table-policy'

let config: PgrConfig

async function computeTableRemoveRls (table: PgrTable): Promise<string> {

  const templateVariables = {
    schemaName: table.schemaName,
    tableName: table.tableName
  }

  return Mustache.render(
    config.scriptTemplates.dropExistingRlsPoliciesTemplate,
    templateVariables
  )
}

async function computeTableScript(tableName: string, schemaTableAssignmentSet: PgrSchemaTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: PgrDbIntrospection, dropExistingRls = false): Promise<PgrTableScript> {
  const spAssignment = schemaTableAssignmentSet.tableAssignments[tableName]
  const spName = typeof spAssignment === 'string' ? spAssignment : spAssignment.tableSecurityProfileName

  const schema = introspection.schemaTree.find((s:PgrSchema) => s.schemaName === schemaTableAssignmentSet.schemaName)
  const table = schema.schemaTables
    .find((t: PgrTable) => t.tableName === tableName)
  const securityProfile = securityProfiles.find((sp: PgrTableSecurityProfile) => sp.name === spName)
  if (!securityProfile) throw new Error(`No securityProfile: ${spName}`)
  if (!table) throw new Error(`No table exists: ${tableName}`)


  let mappedSecurityProfile
  if (typeof spAssignment === 'string') {
    mappedSecurityProfile = securityProfile
  } else {
    const insertExclusions = table.tableColumns.filter(tc => spAssignment.insertAllowances.indexOf(tc.column_name) === -1).map(tc => tc.column_name)
    const updatetExclusions = table.tableColumns.filter(tc => spAssignment.updateAllowances.indexOf(tc.column_name) === -1).map(tc => tc.column_name)
    mappedSecurityProfile = mapSecurityProfile(securityProfile, insertExclusions, updatetExclusions, true)
  }

  const tableScript = await computeTablePolicy(table, mappedSecurityProfile, roles, dropExistingRls)
  const removeRlsScript = await computeTableRemoveRls(table)

  return {
    tableSchema: schemaTableAssignmentSet.schemaName,
    tableName: tableName,
    tableScript: tableScript,
    tableRemoveRlsScript: removeRlsScript
  }
}

async function computeSchemaTableScripts(schemaTableAssignmentSet: PgrSchemaTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: PgrDbIntrospection, dropExistingRls = false):  Promise<PgrSchemaTableScriptSet>{
  const p = Object.keys(schemaTableAssignmentSet.tableAssignments)
    .map(tableName => computeTableScript(tableName, schemaTableAssignmentSet, securityProfiles, roles, introspection, dropExistingRls))

  const tableScripts: PgrTableScript[] = await Promise.all(p)
  return {
    schemaName: schemaTableAssignmentSet.schemaName,
    tableScripts: tableScripts
  }
}

async function computeAllSchemaTableScripts(tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[], mappedSecurityProfiles: PgrTableSecurityProfile[], roleSet: PgrRoleSet, introspection: PgrDbIntrospection, dropExistingRls = false): Promise<PgrMasterTableScriptSet> {
  const p = tableSecurityProfileAssignments
    .map(schemaAssignments => computeSchemaTableScripts(schemaAssignments, mappedSecurityProfiles, roleSet, introspection, dropExistingRls))

  const schemaTableScriptSets = await Promise.all(p)
  return {
    schemaTableScriptSets: schemaTableScriptSets
  }
}

function mapSecurityProfile(
  securityProfile: PgrTableSecurityProfile,
  defaultInsertExclusions: ColumnExclusionSet,
  defaultUpdateExclusions: ColumnExclusionSet,
  force?: boolean
) {
  // here we are calculating the column exclusions for insert and update ops
  return {
    ...securityProfile,
    grants: {
      ...securityProfile.grants,
      INSERT: securityProfile.grants.INSERT.map(
        (grant: PgrRoleGrant) => {
          const exclusions = force ? defaultInsertExclusions : (grant.exclusions || defaultInsertExclusions || [])
          return {
            ...grant,
            exclusions: exclusions
          }
        }
      ),
      UPDATE: securityProfile.grants.UPDATE.map(
        (grant: PgrRoleGrant) => {
          const exclusions = force ? defaultUpdateExclusions : (grant.exclusions || defaultUpdateExclusions || [])
          return {
            ...grant,
            exclusions: exclusions
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
