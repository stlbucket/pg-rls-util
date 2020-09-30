import { writeFileSync } from 'fs';


async function writeSchemaUsageSql(schemaUsageSql: string) {
  const schemaUsageSqlPath = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/schema-usage.sql`
  await writeFileSync(schemaUsageSqlPath, schemaUsageSql)
}

export default writeSchemaUsageSql