const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const ejs = require('ejs')
const _ = require('lodash')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:controller',
  describe: 'Generate a controller in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:controller --module users']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (moduleExists) {
      const controllerFilename = `${moduleName}.controller.js`
      const controllerPath = path.join(modulePath, controllerFilename)

      try {
        await fs.access(controllerPath)

        console.error(chalk.red(`✖ Controller "${controllerFilename}" already exists in module "${moduleName}"`))

        return
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }

      const templatePath = path.join(__dirname, '..', '..', 'templates', 'controller.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      const renderedTemplate = ejs.render(template, { basePath: _.kebabCase(moduleName) })

      await fs.writeFile(controllerPath, renderedTemplate)

      console.log(chalk.green(`✔ Controller "${controllerFilename}" created in module "${moduleName}" successfully!`))
    }
  }
}
