#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const commands = require('../commands')

yargs(hideBin(process.argv))
  .scriptName('rcjs')
  .usage('$0 <command> [options]')
  .command(commands.init)
  .command(commands.make.module)
  .command(commands.make.service)
  .command(commands.make.controller)
  .command(commands.make.model)
  .command(commands.make.migrations)
  .command(commands.db.migrate)
  .command(commands.db.rollback)
  .alias('version', 'v')
  .demandCommand(1, 'You must specify a command. Use --help for usage information.')
  .parse()
