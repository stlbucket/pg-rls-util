import { writeFileSync } from 'fs'

async function writeCreateRolesSql (allScripts: string) {
  const createRolesPathSql = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/create-roles.sql`
  await writeFileSync(createRolesPathSql, allScripts)
}

export default writeCreateRolesSql

