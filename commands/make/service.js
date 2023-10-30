const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const ejs = require('ejs')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:service',
  describe: 'Create a service in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'n', describe: 'Module name', demandOption: true })

    yargs.example([['$0 make:service --module users ']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath)

    if (moduleExists) {
      const templatePath = path.join(__dirname, '..', '..', 'templates', 'service.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      await fs.writeFile(path.join(modulePath, `${moduleName}.service.js`), ejs.render(template, { moduleName }))

      console.log(chalk.green(`✔ Service "${moduleName}.service.js" created in module "${moduleName}" successfully!`))
    }
  }
}
