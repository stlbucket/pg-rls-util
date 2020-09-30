import { writeFileSync } from 'fs';


async function writeOwnershipPolicy(ownershipPolicy: string) {
  const ownershipPolicyPath = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/ownership.sql`
  await writeFileSync(ownershipPolicyPath, ownershipPolicy)
}

export default writeOwnershipPolicy