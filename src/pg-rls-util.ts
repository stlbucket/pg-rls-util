import yargs = require('yargs');
import init from './commands/init'
import generate from './commands/generate'

export async function run() {
  yargs
  .command(init)
  .command(generate)
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