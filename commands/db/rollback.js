module.exports = {
  command: 'db:rollback',
  describe: '',
  builder(yargs) {
    yargs.example([['$0 db:rollback']])

    return yargs
  },
  async handler() {}
}
