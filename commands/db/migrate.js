const path = require('path')
const { Sequelize } = require('sequelize')
const chalk = require('chalk')
const fs = require('fs/promises')
const { performance } = require('perf_hooks')

const getMigrationModel = require('./models/Migration')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'db:migrate',
  describe: 'Execute database migrations for modules in your project',
  builder(yargs) {
    yargs.option('module', {
      alias: 'm',
      describe: 'Module name',
      type: 'string'
    })
    yargs.option('file', { alias: 'f', describe: 'Migration file', type: 'string' })

    if (yargs.argv.file) {
      yargs.demandOption('module', 'Module name must be provided when migrating a single file')
    }

    yargs.example([
      ['$0 db:migrate', 'Execute all pending migrations for all modules'],
      ['$0 db:migrate --module users', 'Execute all pending migrations for a specific module'],
      [
        '$0 db:migrate --module users --file 0001_29102023_create_table_users.js',
        'Execute a specific migration file for a module'
      ]
    ])

    return yargs
  },
  async handler({ module: moduleName, file: migrationFile }) {
    const config = require(path.resolve('config'))

    const sequelize = new Sequelize(config.database)

    const Migration = getMigrationModel(sequelize)

    await sequelize.sync()

    const migrations = await getMigrations(moduleName)

    if (migrations) {
      if (migrationFile) {
        migrations[0].migrationFiles = migrations[0].migrationFiles.filter((item) => item === migrationFile)

        if (!migrations[0].migrationFiles.length) {
          console.error(`\n${chalk.red('✖')}  Migration ${migrationFile} not found in module "${moduleName}"\n`)

          return
        }
      }

      await executeMigrations(migrations, sequelize, Migration)
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

  try {
    await fs.access(modulesPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(chalk.red('✖ The "modules" directory does not exist! Please create it.'))

      process.exit(1)
    } else {
      throw err
    }
  }

  if (moduleName) {
    const modulePath = path.join(modulesPath, moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (!moduleExists) {
      process.exit(1)
    }

    const moduleMigrationsPath = path.join(modulePath, 'migrations')

    try {
      await fs.access(moduleMigrationsPath)

      const moduleMigrations = {
        moduleName,
        migrationFiles: await fs.readdir(moduleMigrationsPath)
      }

      return moduleMigrations.migrationFiles.length ? [moduleMigrations] : null
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (!skipErrorLog) {
          console.error(chalk.red(`✖ Module "${moduleName}" does not have a migration folder!`))
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

/**
 * Execute migrations
 *
 * @param migrations
 * @param sequelize
 * @param Migration
 *
 * @returns {Promise<void>}
 */
async function executeMigrations(migrations, sequelize, Migration) {
  console.log('\nRunning migrations:\n')

  for (const { moduleName, migrationFiles } of migrations) {
    console.log(` Module ${moduleName}:`)

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

          await upMigration(sequelize.getQueryInterface())

          await transaction.commit()

          const timeEnd = performance.now()

          console.log(` ${chalk.green('✔')}  Applying ${migrationFile}... OK ${(timeEnd - timeStart).toFixed(2)} ms`)
        } catch (err) {
          await transaction.rollback()

          console.error(` ${chalk.red('✖')}  Applying ${migrationFile}... FAILED\n`)

          throw err
        }
      }
    }

    console.log()
  }
}
