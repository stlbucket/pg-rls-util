import writeFileToDisk from './write-file-to-disk'
import loadConfig from '../../../../config'

async function writeSchemaUsageSql(schemaUsageSql: string) {
  const config = await loadConfig()
  await writeFileToDisk(config.artifactPaths.schemaUsageSqlPath, schemaUsageSql)
}

export default writeSchemaUsageSql
