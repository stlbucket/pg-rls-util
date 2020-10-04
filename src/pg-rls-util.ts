#!/usr/bin/env node
import yargs = require('yargs');
import init from './commands/init/init'
import generate from './commands/generate/generate'
import release from './commands/release/release'
import diff from './commands/diff/diff'
import merge from './commands/merge/merge'

export async function run() {
  try {
    yargs
    .command(init)
    .command(generate)
    .command(release)
    .command(diff)
    .command(merge)
    .argv;  
  } catch (e) {
    console.error(e)
    process.exit()
  }
}
