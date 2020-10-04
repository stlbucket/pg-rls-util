#!/usr/bin/env node
import yargs = require('yargs');
import init from './commands/init/init'
import generate from './commands/generate'
import release from './commands/release'
import diff from './commands/diff'
import merge from './commands/merge'

export async function run() {
  yargs
  .command(init)
  .command(generate)
  .command(release)
  .command(diff)
  .command(merge)
  .demandCommand()
  .help()
  .argv;
}
