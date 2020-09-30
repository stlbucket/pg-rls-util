import yargs = require('yargs');
// import init from './commands/init'
import initm from './commands/init-module'

export async function run() {
  yargs
  .command(initm)
  // .command('init', 'initialize the current draft or an entire project', 
  //   {
  //     c: { type: 'string', alias: 'connectionString', demandOption: true, description: 'postgres connection string'},
  //     f: { type: 'boolean', alias: 'force', description: 'will reset the current-draft to the previous version or to default if this is a new project' },
  //     x: { type: 'boolean', alias: 'forceAll', description: 'will reset the entire project' }
  //   }, 
  //   async (argv) => {
  //     await init(argv)
  //   }
  // )
  .command('generate', 'generate all script files', 
    {
    }, 
    (argv) => {
      console.log('generate', argv)
    }
  )
  .command('release', 'release the current draft to a new numbered release', 
    {
    }, 
    (argv) => {
      console.log('release', argv)
    }
  )
  .command('diff', 'analyze the difference in database structure against current draft', 
    {
    }, 
    (argv) => {
      console.log('diff', argv)
    }
  )
  .command('merge', 'merge existing table and function assignment sets with diff results', 
    {
    }, 
    (argv) => {
      console.log('merge', argv)
    }
  )
  .argv;
}

run()