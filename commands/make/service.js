const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const ejs = require('ejs')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:service',
  describe: 'Generate a service in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:service --module users']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (moduleExists) {
      const serviceFilename = `${moduleName}.service.js`
      const servicePath = path.join(modulePath, serviceFilename)

      try {
        await fs.access(servicePath)

        console.error(chalk.red(`✖ Service "${serviceFilename}" already exists in module "${moduleName}"`))

        return
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }

      const templatePath = path.join(__dirname, '..', '..', 'templates', 'service.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      const renderedTemplate = ejs.render(template, { moduleName })

      await fs.writeFile(servicePath, renderedTemplate)

      console.log(chalk.green(`✔ Service "${serviceFilename}" created in module "${moduleName}" successfully!`))
    }
  }
}
