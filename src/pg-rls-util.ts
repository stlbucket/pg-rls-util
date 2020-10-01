import yargs = require('yargs');
import init from './commands/init'
import generate from './commands/generate'
import release from './commands/release'
import diff from './commands/diff'

export async function run() {
  yargs
  .command(init)
  .command(generate)
  .command(release)
  .command(diff)
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