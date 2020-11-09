import { table } from 'console'
import * as Mustache from 'mustache'
import loadConfig from "../../../../config"
import { PgrRole, PgrRoleGrant, PgrSchemaTableProfileAssignmentSet, PgrTableSecurityProfile, PgrColumnAllowanceSet, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfile } from '../../../../d'

async function computeSchemaUsageSql () {
  const config = await loadConfig()

  const revokeRolesList = ['public', ...config.roleSet.dbUserRoles.map((r:PgrRole) => r.roleName)].join(',\n       ')

  const tableSchemaUsage = config.tableSecurityProfileAssignmentSets
  .map(
    (tpaSet: PgrSchemaTableProfileAssignmentSet) => {
      const grantRolesList = Array.from(new Set(Object.values(tpaSet.tableAssignments)))
      .map(
        (tableAssignment: string | PgrColumnAllowanceSet) => {
          const profileName = typeof tableAssignment === 'string' ? tableAssignment : tableAssignment.tableSecurityProfileName
          const tsp = config.tableSecurityProfileSet.tableSecurityProfiles.find((tsp:PgrTableSecurityProfile) => tsp.name === profileName)
          if (!tsp) throw new Error(`No security profile: ${profileName}`)
          return Object.values(tsp.grants)
          .reduce(
            (all:string[], roleGrants: PgrRoleGrant[]) => {
              return Array.from(new Set([...all, ...roleGrants.map(rg => rg.roleName)]))
            }, []
          )
        }
      )
      .reduce(
        (all:string[], these: string[]) => {
          return Array.from(new Set([...all, ...these]))
        }, []
      )

      return {
        schemaName: tpaSet.schemaName,
        revokeRolesList: revokeRolesList,
        showGrants: grantRolesList.length > 0,
        grantRolesList: grantRolesList
      }
    }
  )

  const functionSchemaUsage = config.functionSecurityProfileAssignments
  .map(
    (faSet: PgrFunctionSecurityProfileAssignmentSet) => {
      const grantRolesList = Array.from(new Set(Object.values(faSet.functionAssignments)))
      .map(
        (functionAssignment: string) => {
          const fap = config.functionSecurityProfileSet.functionSecurityProfiles.find((fsp:PgrFunctionSecurityProfile) => fsp.name === functionAssignment)
          if (!fap) throw new Error(`No function assignment profile: ${functionAssignment}`)
          return fap.grants.EXECUTE
        }
      )
      .reduce(
        (all:string[], these: string[]) => {
          return Array.from(new Set([...all, ...these]))
        }, []
      )

      return {
        schemaName: faSet.schemaName,
        revokeRolesList: revokeRolesList,
        showGrants: grantRolesList.length > 0,
        grantRolesList: grantRolesList
      }
    }
  )

  const allUsage: any[] = [...tableSchemaUsage, ...functionSchemaUsage]
  .reduce(
    (all: any[], s: any) => {
      const existing = all.find(a => a.schemaName === s.schemaName)
      if (existing) {
        const others = all.filter(a => a.schemaName !== s.schemaName)
        // return Array.from(new Set([...all, ...roleGrants.map(rg => rg.roleName)]))
        const grantRolesList = Array.from(new Set([...existing.grantRolesList, ...s.grantRolesList]))
        return [
          ...others, {
            ...existing,
            showGrants: grantRolesList.length > 0,
            grantRolesList: grantRolesList
          }
        ]

      } else {
        return [...all, s]
      }
    }, []
  )

  // console.log(tableSchemaUsage)
  // console.log(functionSchemaUsage)
  // console.log(allUsage)
  // process.exit()

  return Mustache.render(
    config.scriptTemplates.schemaUsageSqlTemplate,
    {
      schemata: allUsage,
      dbAuthenticatorRole: config.roleSet.dbAuthenticatorRole.roleName,
    }
  )
}


export default computeSchemaUsageSql
