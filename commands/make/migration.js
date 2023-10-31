const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')
const chalk = require('chalk')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:migration [name]',
  describe: 'Generate a database migration file in a module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Migration name', demandOption: true, type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([
      ['$0 make:migration load_user_data --module users'],
      ['$0 make:migration --name load_user_data --module users']
    ])

    return yargs
  },
  async handler({ name: migrationName, module: moduleName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (moduleExists) {
      const migrationsPath = path.join(modulePath, 'migrations')

      try {
        await fs.access(migrationsPath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.mkdir(migrationsPath)
        } else {
          throw err
        }
      }

      const migrationFiles = await fs.readdir(migrationsPath)

      const migrationNumber = (migrationFiles.length + 1).toString().padStart(4, '0')
      const migrationDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const migrationFilename = `${migrationNumber}_${migrationDate}_${migrationName}.js`

      const migrationFilepath = path.join(migrationsPath, migrationFilename)
      const templatePath = path.join(__dirname, 'templates', 'migration.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      const renderedTemplate = ejs.render(template)

      await fs.writeFile(migrationFilepath, renderedTemplate)

      console.log(
        `${chalk.green('✔')} Migration '${migrationFilename}' created in module '${moduleName}' successfully!`
      )
    }
  }
}
