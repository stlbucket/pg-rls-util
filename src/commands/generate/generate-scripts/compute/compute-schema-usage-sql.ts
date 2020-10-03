import * as Mustache from 'mustache'
import loadConfig from "../../../../config"
import { PgrRole, PgrRoleGrant, PgrSchemaTableProfileAssignmentSet, PgrTableSecurityProfile } from '../../../../d'

async function computeSchemaUsageSql () {
  const config = await loadConfig()

  const revokeRolesList = ['public', ...config.roleSet.dbUserRoles.map((r:PgrRole) => r.roleName)].join(',\n       ')

  const schemata = config.tableSecurityProfileAssignmentSets
  .map(
    (tpaSet: PgrSchemaTableProfileAssignmentSet) => {
      const grantRolesList = Array.from(new Set(Object.values(tpaSet.tableAssignments)))
      .map(
        (profileName: string) => {
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

  return Mustache.render(
    config.scriptTemplates.schemaUsageSqlTemplate,
    {
      schemata: schemata,
      dbAuthenticatorRole: config.roleSet.dbAuthenticatorRole.roleName,
    }
  )
}


export default computeSchemaUsageSql