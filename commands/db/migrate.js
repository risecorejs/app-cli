const path = require('path')
const { Sequelize } = require('sequelize')

const getMigrationModel = require('./models/Migration')
const fs = require('fs/promises')
const chalk = require('chalk')
const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'db:migrate',
  describe: '',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', type: 'string' })
    yargs.option('file', { alias: 'm', describe: 'Migration file', type: 'string' })

    yargs.example([
      ['$0 db:migrate'],
      ['$0 db:migrate --module users'],
      ['$0 db:migrate --module users --file 0001_29102023_create_table_users.js']
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
      console.log(migrations)
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
 * @returns {Promise<*[]|null|{moduleName, migrationFiles: string[]}>}
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
          console.error(chalk.red(`✖ There is no migrations folder in the "${moduleName}" module!`))
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
