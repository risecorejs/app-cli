module.exports = {
  command: 'make:migration [name]',
  describe: 'Generate a database migration file in a module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Migration filename', demandOption: true, type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([
      ['$0 make:migration load_user_data --module users'],
      ['$0 make:migration --name load_user_data --module users']
    ])

    return yargs
  },
  async handler() {}
}
