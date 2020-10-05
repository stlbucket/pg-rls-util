import soroAnon from './profile-sets/soro-anon/table-security-profiles'
import graphileStarter from './profile-sets/graphile-starter/table-security-profiles'
import { PgrTableSecurityProfileSet } from '../d'

async function getDefaultTableSecurityProfiles(key: string): Promise<PgrTableSecurityProfileSet> {
  switch (key) {
    case 'soro-anon':
      return soroAnon
    case 'graphile-starter':
      return graphileStarter
    default:
      return graphileStarter
  }
}

export default getDefaultTableSecurityProfiles