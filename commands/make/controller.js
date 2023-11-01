const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')
const _ = require('lodash')

const { checkModuleExists, checkFileUniqueness } = require('../../lib/utils')

module.exports = {
  command: 'make:controller',
  describe: 'Generate a controller in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:controller --module users']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const spinner = ora('Generating controller...').start()

    const modulePath = path.resolve('modules', moduleName)

    await checkModuleExists(modulePath, moduleName, spinner)

    const controllerFilename = `${moduleName}.controller.js`
    const controllerFilepath = path.join(modulePath, controllerFilename)

    await checkFileUniqueness(
      controllerFilepath,
      `Controller '${controllerFilename}' already exists in module '${moduleName}'!`,
      spinner
    )

    const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', 'controller.ejs')

    const template = await fs.readFile(templatePath, 'utf-8')

    const renderedTemplate = ejs.render(template, { basePath: _.kebabCase(moduleName) })

    await fs.writeFile(controllerFilepath, renderedTemplate)

    spinner.succeed(`Controller '${controllerFilename}' created in module '${moduleName}' successfully!`)
  }
}
