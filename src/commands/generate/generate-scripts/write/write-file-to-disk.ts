import { writeFileSync } from "fs"

function cleanContents(contents) {
  return contents
  .split('&#x3D;').join('=')
  .split('&amp;#39;').join(`'`)
}

async function writeFileToDisk(path, contents) {
  await writeFileSync(path, cleanContents(contents))
}

export default writeFileToDisk
