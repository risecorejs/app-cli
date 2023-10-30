module.exports = {
  command: 'make:migrations',
  describe: '',
  builder(yargs) {
    yargs.example([['$0 make:migrations']])

    return yargs
  },
  async handler() {}
}
