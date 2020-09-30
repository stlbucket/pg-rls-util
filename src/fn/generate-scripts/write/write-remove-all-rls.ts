import { writeFileSync } from 'fs'

async function writeRemoveAllRlsPolicy (allScripts: string) {
  const removeAllRlsPath = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/remove-all-rls.sql`
  await writeFileSync(removeAllRlsPath, allScripts)
}

export default writeRemoveAllRlsPolicy

