import soroAnon from './profile-sets/soro-anon/table-security-profiles'
import graphileStarter from './profile-sets/graphile-starter/table-security-profiles'
import appJwt from './profile-sets/app-jwt/table-security-profiles'
import { PgrTableSecurityProfileSet } from '../d'

async function getDefaultTableSecurityProfiles(key: string): Promise<PgrTableSecurityProfileSet> {
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

export default getDefaultTableSecurityProfiles
