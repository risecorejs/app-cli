module.exports = {
  command: 'make:model',
  describe: 'Create a model in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true })
    yargs.option('name', { alias: 'm', describe: 'Model name', demandOption: true })

    yargs.example([['$0 make:model --module users --name User']])

    return yargs
  },
  handler({ module, name }) {}
}
