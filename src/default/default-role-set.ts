import soroAnon from './profile-sets/soro-anon/role-set'
import graphileStarter from './profile-sets/graphile-starter/role-set'
import { PgrRoleSet } from '../d'

async function getDefaultRoleSetSecurityProfiles(key: string): Promise<PgrRoleSet> {
  switch (key) {
    case 'soro-anon':
      return soroAnon
    case 'graphile-starter':
      return graphileStarter
    default:
      return graphileStarter
  }
}

export default getDefaultRoleSetSecurityProfiles