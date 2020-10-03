import { PgrDbIntrospection } from '../../../d'
import computeAllScripts from './compute/compute-all-scripts'
import writeAllScripts from './write/write-all-scripts'

async function generateAllScripts(introspection: PgrDbIntrospection) {
    const allScripts = await computeAllScripts(introspection)
    await writeAllScripts(allScripts)
}

export default generateAllScripts