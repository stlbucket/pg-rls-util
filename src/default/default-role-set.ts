import soroAnon from './profile-sets/soro-anon/role-set'
import graphileStarter from './profile-sets/graphile-starter/role-set'
import appJwt from './profile-sets/app-jwt/role-set'
import { PgrRoleSet } from '../d'

async function getDefaultRoleSetSecurityProfiles(key: string): Promise<PgrRoleSet> {
  switch (key) {
    case 'soro-anon':
      return soroAnon
    case 'graphile-starter':
      return graphileStarter
    case 'app-jwt':
      return appJwt
    default:
      return graphileStarter
  }
}

export default getDefaultRoleSetSecurityProfiles
