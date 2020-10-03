import computeSchemaUsageSql from './compute/compute-schema-usage-sql'
import writeSchemaUsageSql from './write/write-schema-usage-sql'

async function generateSchemaUsageSql() {
  const schemaUsageSql = await computeSchemaUsageSql()
  await writeSchemaUsageSql(schemaUsageSql)
}

export default generateSchemaUsageSql