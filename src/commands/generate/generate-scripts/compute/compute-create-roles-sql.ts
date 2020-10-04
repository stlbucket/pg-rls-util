import * as Mustache from 'mustache'
import loadConfig from '../../../../config'


async function computeCreateRolesSql () {
  const config = await loadConfig()
  const roleSet = config.roleSet

  return Mustache.render(
    config.scriptTemplates.rolesTemplate,
    roleSet
  )
}

export default computeCreateRolesSql
