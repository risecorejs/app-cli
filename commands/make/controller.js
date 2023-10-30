const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')
const _ = require('lodash')
const chalk = require('chalk')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:controller',
  describe: 'Create a controller in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'n', describe: 'Module name', demandOption: true })

    yargs.example([['$0 make:controller --module users ']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath)

    if (moduleExists) {
      const templatePath = path.join(__dirname, '..', '..', 'templates', 'controller.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      await fs.writeFile(
        path.join(modulePath, `${moduleName}.controller.js`),
        ejs.render(template, { basePath: _.kebabCase(moduleName) })
      )

      console.log(
        chalk.green(`✔ Controller "${moduleName}.controller.js" created in module "${moduleName}" successfully!`)
      )
    }
  }
}
