const path = require('path')
const chalk = require('chalk')
const fs = require('fs/promises')
const { performance } = require('perf_hooks')

const { logError, checkDirectoryExists, checkModuleExists } = require('../../lib/utils')

module.exports = {
  command: 'db:migrate [file]',
  describe: 'Execute database migration files of modules',
  builder(yargs) {
    yargs.option('file', { alias: 'f', describe: 'Migration file', type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', type: 'string' })

    if (yargs.argv.file || yargs.argv._[1]) {
      yargs.demandOption('module', 'Module name must be provided when migrating a single file')
    }

    yargs.example([
      ['$0 db:migrate', 'Execute all pending migrations for all modules'],
      ['$0 db:migrate --module users', 'Execute all pending migrations for a specific module'],
      [
        '$0 db:migrate 0001_20231029_create_table_users.js --module users',
        'Execute a specific migration file for a module'
      ],
      [
        '$0 db:migrate --file 0001_20231029_create_table_users.js --module users',
        'Execute a specific migration file for a module'
      ]
    ])

    return yargs
  },
  async handler({ module: moduleName, file: migrationFile }) {
    const { sequelize, Migration } = require('../../lib/models')

    await Migration.sync()

    const migrations = await getMigrations(moduleName)

    if (migrationFile) {
      if (migrations && migrations.length) {
        migrations[0].migrationFiles = migrations[0].migrationFiles.filter((item) => item === migrationFile)
      }

      if (!migrations || !migrations.length || !migrations[0].migrationFiles.length) {
        logError(`Migration '${migrationFile}' not found in module '${moduleName}'!`)

        process.exit(1)
      }
    }

    if (migrations && migrations.length) {
      console.log('\nRunning migrations:\n')

      for (const { moduleName, migrationFiles } of migrations) {
        console.log(` Module '${moduleName}':`)

        const appliedMigrationsCount = { value: 0 }

        for (const migrationFile of migrationFiles) {
          const transaction = await sequelize.transaction()

          const [, created] = await Migration.findOrCreate({
            where: {
              filename: migrationFile,
              module: moduleName
            },
            transaction
          })

          if (created) {
            const migrationFilepath = path.resolve('modules', moduleName, 'migrations', migrationFile)

            try {
              const timeStart = performance.now()

              const { up: upMigration } = require(migrationFilepath)

              await upMigration(sequelize.getQueryInterface(), transaction)

              await transaction.commit()

              appliedMigrationsCount.value++

              const timeEnd = performance.now()

              console.log(
                ` ${chalk.green('✔')}  Applying ${chalk.bold(migrationFile)}... ${chalk.green('OK')} - ${(
                  timeEnd - timeStart
                ).toFixed(2)} ms`
              )
            } catch (err) {
              await transaction.rollback()

              console.error(` ${chalk.red('✖')}  Applying ${migrationFile}... ${chalk.red('FAILED')}\n`)

              throw err
            }
          } else {
            await transaction.commit()
          }
        }

        if (appliedMigrationsCount.value === 0) {
          console.log(chalk.gray(' i  No new migrations to apply to the database.'))
        }

        console.log()
      }
    } else {
      console.log(chalk.gray('i No migrations to apply to the database.'))
    }

    await sequelize.close()
  }
}

/**
 * Get migrations
 *
 * @param moduleName {string}
 * @param [skipErrorLog=false] {boolean}
 *
 * @returns {Promise<null|{moduleName, migrationFiles: string[]}[]>}
 */
async function getMigrations(moduleName, skipErrorLog = false) {
  const modulesPath = path.resolve('modules')

  await checkDirectoryExists(modulesPath, "The 'modules' directory does not exist!")

  if (moduleName) {
    const modulePath = path.join(modulesPath, moduleName)

    await checkModuleExists(modulePath, moduleName)

    const moduleMigrationsPath = path.join(modulePath, 'migrations')

    try {
      await fs.access(moduleMigrationsPath)

      const moduleMigrationFiles = await fs.readdir(moduleMigrationsPath)

      const moduleMigrations = {
        moduleName,
        migrationFiles: moduleMigrationFiles
      }

      return moduleMigrations.migrationFiles.length ? [moduleMigrations] : null
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (!skipErrorLog) {
          logError(`Module '${moduleName}' does not have a migration folder!`)
        }

        return null
      } else {
        throw err
      }
    }
  } else {
    const moduleDirectories = await fs.readdir(modulesPath)

    const migrations = []

    for (const moduleName of moduleDirectories) {
      const moduleMigrations = await getMigrations(moduleName, true)

      if (moduleMigrations) {
        migrations.push(...moduleMigrations)
      }
    }

    return migrations
  }
}
