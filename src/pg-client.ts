const { Pool } = require('pg')
import loadConfig from "./config"
import { PgrConnectionInfo } from './d'

const userTable = 'soro_auth.soro_user'
let pool: any

const initPool = async() => {
  const config = await loadConfig()
  const connectionString = config.dbConfig.connectionString

  if (!connectionString) throw new Error('config.connectionString required')

  pool = new Pool({
    connectionString: connectionString,
  })
}


const doQuery = async (sql: string, params?: string [], asUsername?: string) => {
  let client
  await initPool()
  try {
    client = await pool.connect()
    if (asUsername) {
      const user = (await client.query(`select * from ${userTable} where username = $1;`, [asUsername])).rows[0]
      await client.query(`set jwt.claims.contact_id = '${user.contact_id}';`)
    }
    const result = await client.query(sql,params)
    return result
  } catch (e) {
    console.log('ERROR: PGCLIENT:', e.toString())
    throw e
  } finally {
    if (client) client.release()
  }
}

const findUser = async (username: string) => {
  const result = await doQuery(`select * from ${userTable} where username = $1;`, [username]);
  return result.rows[0];
};

const becomeUser = async (username: string) => {
  const user = await findUser(username)
  await doQuery(`set jwt.claims.contact_id = '${user.contact_id}';`);
  return user
};

const getConnectionInfo = async (): Promise<PgrConnectionInfo> => {
  const config = await loadConfig()
  const connectionString = config.dbConfig.connectionString
  if (!connectionString) throw new Error('config.connectionString required')
  const dbUser = connectionString.split('://')[1].split(':')[0]
  const dbPassword = connectionString.split('://')[1].split(':')[1].split('@')[0]
  const dbName = connectionString.split('://')[1].split('/')[1]
  const dbHost = connectionString.split('://')[1].split('@')[1].split(':')[0].split('/')[0]
  const dbPort = connectionString.split('://')[1].split('@')[1].split('/')[0].split(':')[1]

  return {
    dbUser: dbUser
    ,dbPassword: dbPassword
    ,dbName: dbName
    ,dbHost: dbHost
    ,dbPort: dbPort
    ,dbConnectionString: connectionString
  }
}

export {
  getConnectionInfo
  ,doQuery
  ,findUser
  ,becomeUser
}
