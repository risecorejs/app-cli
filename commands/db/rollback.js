const { sequelize, Migration } = require('./models')

module.exports = {
  command: 'db:rollback [filename]',
  describe: 'Rollback the last database migration files of modules',
  builder(yargs) {
    yargs.option('filename', { alias: 'f', describe: 'Migration filename', type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', type: 'string' })

    if (yargs.argv.filename) {
      yargs.demandOption('module', 'Module name must be provided when rolling back a single migration file')
    }

    yargs.example([
      ['$0 db:rollback', 'Rollback the last database migration for all modules'],
      ['$0 db:rollback --module users', 'Rollback the last database migration for a specific module'],
      [
        '$0 db:rollback 0001_20231029_create_table_users.js --module users',
        'Rollback a specific migration file for a module'
      ],
      [
        '$0 db:rollback --filename 0001_20231029_create_table_users.js --module users',
        'Rollback a specific migration file for a module'
      ]
    ])

    return yargs
  },
  async handler({ module: moduleName, filename: migrationFilename }) {
    await sequelize.sync()

    // todo: заменить на whereBuilder
    const where = {}

    if (moduleName) where.module = moduleName
    if (migrationFilename) where.filename = migrationFilename

    const migrations = await Migration.findAll({
      where,
      order: [['filename', 'DESC']]
    })

    const groupMigrationsMap = new Map()

    for (const migration of migrations) {
      if (groupMigrationsMap.has(migration.module)) {
        groupMigrationsMap.get(migration.module).push(migration.filename)
      } else {
        groupMigrationsMap.set(migration.module, [migration.filename])
      }
    }

    console.log(groupMigrationsMap)

    await sequelize.close()
  }
}
