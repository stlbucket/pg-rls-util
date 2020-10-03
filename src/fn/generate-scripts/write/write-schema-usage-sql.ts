import { writeFileSync } from 'fs';
import loadConfig from '../../../config'

async function writeSchemaUsageSql(schemaUsageSql: string) {
  const config = await loadConfig()
  await writeFileSync(config.artifactPaths.schemaUsageSqlPath, schemaUsageSql)
}

export default writeSchemaUsageSql