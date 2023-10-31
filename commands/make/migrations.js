module.exports = {
  command: 'make:migrations',
  describe: 'Generate database migration files based on module models',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })
    yargs.option('model', { describe: 'Model name', type: 'string' })

    if (yargs.argv.model) {
      yargs.demandOption('module', 'Module name must be provided when generating migrations for a specific model')
    }

    yargs.example([
      ['$0 make:migrations'],
      ['$0 make:migrations --module users'],
      ['$0 make:migrations --module users --model User']
    ])

    return yargs
  },
  async handler() {}
}
