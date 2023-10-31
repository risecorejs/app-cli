module.exports = {
  command: 'db:rollback [file]',
  describe: 'Rollback the last database migration files of modules',
  builder(yargs) {
    yargs.option('file', { alias: 'f', describe: 'Migration file', type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', type: 'string' })

    if (yargs.argv.file) {
      yargs.demandOption('module', 'Module name must be provided when rolling back a single file')
    }

    yargs.example([
      ['$0 db:rollback', 'Rollback the last database migration for all modules'],
      ['$0 db:migrate --module users', 'Rollback the last database migration for a specific module'],
      [
        '$0 db:migrate 0001_20231029_create_table_users.js --module users',
        'Rollback a specific migration file for a module'
      ],
      [
        '$0 db:migrate --file 0001_20231029_create_table_users.js --module users',
        'Rollback a specific migration file for a module'
      ]
    ])

    return yargs
  },
  async handler() {}
}
