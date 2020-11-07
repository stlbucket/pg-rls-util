import soroAnon from './profile-sets/soro-anon/function-security-profiles'
import graphileStarter from './profile-sets/graphile-starter/function-security-profiles'
import appJwt from './profile-sets/app-jwt/function-security-profiles'
import { PgrFunctionSecurityProfileSet } from '../d'

async function getDefaultFunctionSecurityProfiles(key: string): Promise<PgrFunctionSecurityProfileSet> {
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

export default getDefaultFunctionSecurityProfiles
