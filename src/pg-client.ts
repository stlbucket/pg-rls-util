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


const doQuery = async (sql: string, params?: string []) => {
  let client
  await initPool()
  try {
    client = await pool.connect()
    const result = await client.query(sql,params)
    return result
  } catch (e) {
    console.log('ERROR: PGCLIENT:', e.toString())
    throw e
  } finally {
    if (client) client.release()
  }
}

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
}
