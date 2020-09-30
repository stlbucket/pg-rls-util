import loadConfig from '../../../config'
import { PgrRoleSet } from '../../../d'

function computeDbOwnerRoleSql (roleSet: PgrRoleSet) {
  const dbOwnerRole = roleSet.dbOwnerRole
  return `
------------  DB OWNER ROLE ------------
DO
$body$
BEGIN
  IF NOT EXISTS (
    SELECT    *
    FROM   pg_catalog.pg_roles
    WHERE  rolname = '${dbOwnerRole.roleName}')
  THEN
    CREATE ROLE ${dbOwnerRole.roleName};
  END IF;

  ALTER ROLE ${dbOwnerRole.roleName} with LOGIN;
  ALTER ROLE ${dbOwnerRole.roleName} with CREATEDB;

END
$body$;
--||--
---------- END DB OWNER ROLE -----------
  `

}

function computeDbAuthenticatorRoleSql (roleSet: PgrRoleSet) {
  const dbAuthenticatorRole = roleSet.dbAuthenticatorRole
  const dbUserRoles = roleSet.dbUserRoles
  return `
------------  DB AUTHENTICATOR ROLE ------------
DO
$body$
BEGIN
  IF NOT EXISTS (
    SELECT    *
    FROM   pg_catalog.pg_roles
    WHERE  rolname = '${dbAuthenticatorRole.roleName}')
  THEN
    CREATE ROLE ${dbAuthenticatorRole.roleName};
  END IF;

ALTER ROLE ${dbAuthenticatorRole.roleName} with LOGIN;
ALTER ROLE ${dbAuthenticatorRole.roleName} with NOINHERIT;

${dbUserRoles.map(ur => `GRANT ${ur.roleName} TO ${dbAuthenticatorRole.roleName};`).join('\n')}

END
$body$;
--||--
---------- END DB AUTHENTICATOR ROLE -----------
  `
}

function computeDbAnonymousRoleSql (roleSet: PgrRoleSet) {
  const dbAnonymousRole = roleSet.dbAnonymousRole
  return dbAnonymousRole ? `
------------  DB ANONYMOUS ROLE ------------
DO
$body$
BEGIN
  IF NOT EXISTS (
    SELECT    *
    FROM   pg_catalog.pg_roles
    WHERE  rolname = '${dbAnonymousRole.roleName}')
  THEN
    CREATE ROLE ${dbAnonymousRole.roleName};
  END IF;

ALTER ROLE ${dbAnonymousRole.roleName} with NOLOGIN;

END
$body$;
--||--
---------- END DB ANONYMOUS ROLE -----------
  ` : ''
}

function computeDbUserRolesSql (roleSet: PgrRoleSet) {
  const dbUserRoles = roleSet.dbUserRoles.sort((a,b)=>{
    return (a.applicableRoles || []).length - (b.applicableRoles || []).length  
  })
  return `
---------- DB USER ROLES -----------
${dbUserRoles.map(ur => {
return `
    ------------ ${ur.roleName}
      DO
      $body$
      BEGIN
        IF NOT EXISTS (
          SELECT    *
          FROM   pg_catalog.pg_roles
          WHERE  rolname = '${ur.roleName}'
        ) THEN
          CREATE ROLE ${ur.roleName};
        END IF;

        ALTER ROLE ${ur.roleName} with NOLOGIN;
        ${(ur.applicableRoles || []).map(ar => {
          return `
        GRANT ${ar.roleName} TO ${ur.roleName};`
        }).join('')}

      END
      $body$;
      --||--
    -------- END ${ur.roleName}
`
}).join('\n')}
---------- END USER ROLES ----------

`
}

async function computeCreateRolesSql () {
  const config = await loadConfig()
  const roleSet = config.roleSet

  return [
    `
----------
----------  BEGIN POSTGRES ROLES SQL
----------
    `,
    computeDbOwnerRoleSql(roleSet),
    computeDbUserRolesSql(roleSet),
    computeDbAuthenticatorRoleSql(roleSet),
    computeDbAnonymousRoleSql(roleSet),
    `
----------
----------  END POSTGRES ROLES SQL
----------
--==
`
  ].join('\n')
}

export default computeCreateRolesSql
