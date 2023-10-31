const path = require('path')
const { performance } = require('perf_hooks')
const chalk = require('chalk')

const { sequelize, Migration } = require('./models')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'db:rollback [file]',
  describe: 'Rollback the last database migration files of modules',
  builder(yargs) {
    yargs.option('file', { alias: 'f', describe: 'Migration file', type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', type: 'string' })

    if (yargs.argv.file || yargs.argv._[1]) {
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
        '$0 db:rollback --file 0001_20231029_create_table_users.js --module users',
        'Rollback a specific migration file for a module'
      ]
    ])

    return yargs
  },
  async handler({ module: moduleName, file: migrationFile }) {
    await sequelize.sync()

    // todo: заменить на whereBuilder
    const where = {}

    if (moduleName) {
      const modulesPath = path.resolve('modules')
      const modulePath = path.join(modulesPath, moduleName)

      const moduleExists = await checkModuleExists(modulePath, moduleName)

      if (!moduleExists) {
        process.exit(1)
      }

      where.module = moduleName
    }

    if (migrationFile) where.filename = migrationFile

    const migrations = await Migration.findAll({
      where,
      order: [['createdAt', 'DESC']]
    })

    console.log('\nRolling back migrations:\n')

    if (migrations.length) {
      const groupMigrationsMap = new Map()

      for (const migration of migrations) {
        if (groupMigrationsMap.has(migration.module)) {
          groupMigrationsMap.get(migration.module).push(migration.filename)
        } else {
          groupMigrationsMap.set(migration.module, [migration.filename])
        }
      }

      for (const [module, filenames] of groupMigrationsMap) {
        console.log(` Module '${module}':`)

        for (const filename of filenames) {
          const transaction = await sequelize.transaction()

          const migrationFilepath = path.resolve('modules', module, 'migrations', filename)

          try {
            const timeStart = performance.now()

            const { down: downMigration } = require(migrationFilepath)

            await Migration.destroy({
              where: {
                filename,
                module
              },
              transaction
            })

            await downMigration(sequelize.getQueryInterface(), transaction)

            await transaction.commit()

            const timeEnd = performance.now()

            console.log(
              ` ${chalk.green('✔')}  Unapplying ${chalk.bold(filename)}... ${chalk.green('OK')} - ${(
                timeEnd - timeStart
              ).toFixed(2)} ms`
            )
          } catch (err) {
            await transaction.rollback()

            console.error(` ${chalk.red('✖')}  Applying ${filename}... ${chalk.red('FAILED')}\n`)

            throw err
          }
        }

        console.log()
      }
    } else {
      console.log(chalk.gray(' i  No migrations for rollback.\n'))
    }

    await sequelize.close()
  }
}
