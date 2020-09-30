import computeCreateRolesSql from './compute/compute-create-roles-sql'
import writeCreateRolesSql from './write/write-create-roles'

async function generateCreateRolesSql () {
  const createRolesSql = await computeCreateRolesSql()
  await writeCreateRolesSql(createRolesSql)
}

export default generateCreateRolesSql

