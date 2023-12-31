const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')

const { checkModuleExists, createDirectoryIfNotExists } = require('../../lib/utils')

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
    const spinner = ora('Generating migration...').start()

    const modulePath = path.resolve('modules', moduleName)

    await checkModuleExists(modulePath, moduleName, spinner)

    const migrationsPath = path.join(modulePath, 'migrations')

    await createDirectoryIfNotExists(migrationsPath)

    const migrationFiles = await fs.readdir(migrationsPath)

    const migrationNumber = (migrationFiles.length + 1).toString().padStart(4, '0')
    const migrationDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const migrationFilename = `${migrationNumber}_${migrationDate}_${migrationName}.js`

    const migrationFilepath = path.join(migrationsPath, migrationFilename)
    const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', 'migration.ejs')

    const template = await fs.readFile(templatePath, 'utf-8')

    const renderedTemplate = ejs.render(template)

    await fs.writeFile(migrationFilepath, renderedTemplate)

    spinner.succeed(`Migration '${migrationFilename}' created in module '${moduleName}' successfully!`)
  }
}
