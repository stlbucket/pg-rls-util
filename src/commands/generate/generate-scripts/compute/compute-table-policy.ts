import loadConfig from '../../../../config'
import { PgrTable, PgrTableSecurityProfile, PgrRoleSet, PgrRole, PgrConfig } from '../../../../d'

import * as Mustache from 'mustache'
let config: PgrConfig

async function computeTablePolicy (table: PgrTable, tableSecurityProfile: PgrTableSecurityProfile, roles: PgrRoleSet, dropExistingRls = false): Promise<string> {
  config = await loadConfig()
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:PgrRole) => r.roleName)]

  const rlsPolicies = Object.keys(tableSecurityProfile.policies).reduce(
    (all: any, action: string) => {
      const actionPolicies = tableSecurityProfile.policies[action].map(
        (p: any) => {

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
        (g: any) => {

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
      const finalGrant = all.find((g: any) => g.roleName === roleGrant.roleName) || {...roleGrant, grants: []}
      const otherGrants = all.filter((g: any) => g.roleName !== roleGrant.roleName)
      const exclusions = roleGrant.exclusions || []
      const grantColumns = (['INSERT','UPDATE'].indexOf(roleGrant.action) > -1 ? table.tableColumns : [])
        .map((tc: any) => tc.column_name)
        .filter((c:string) => exclusions.indexOf(c) === -1)
      const grantColumnsText = grantColumns.length > 0 ? `(${grantColumns.join(', ')})` : null
      const columnExclusionsText = exclusions.length > 0 ? `\n       --  excluded columns for ${roleGrant.action}: ${exclusions.join(', ')}` : null 

      return [...otherGrants, {
        ...finalGrant, 
        grants: [...finalGrant.grants.map((og: any) => { return {...og, comma: ','}}), {action: roleGrant.action, grantColumns: grantColumnsText, columnExclusionsText: columnExclusionsText}]
      }]
    }, []
  )

  const templateVariables = {
    enableRls: tableSecurityProfile.enableRls,
    schemaName: table.schemaName,
    tableName: table.tableName,
    tableSecurityProfileName: tableSecurityProfile.name,
    revokeRolesList: revokeRolesList.join(',\n       '),
    grantRolesList: roles.dbUserRoles.map((r: any) => r.roleName).join(",\n"),
    rlsPolicies: rlsPolicies,
    roleGrants: roleGrants,
    dropExistingRls: dropExistingRls
  }

  const tableScript =  Mustache.render(
    config.scriptTemplates.tablePolicyTemplate,
    templateVariables
  )
  .split('&#x3D;')
  .join('=')

  return tableScript

}

export default computeTablePolicy
