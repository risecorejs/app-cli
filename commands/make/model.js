const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')
const chalk = require('chalk')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:model',
  describe: 'Create a model in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true })
    yargs.option('name', { alias: 'm', describe: 'Model name', demandOption: true })

    yargs.example([['$0 make:model --module users --name User']])

    return yargs
  },
  async handler({ module: moduleName, name: modelName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath)

    if (moduleExists) {
      const modelsPath = path.join(modulePath, 'models')

      try {
        await fs.access(modelsPath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.mkdir(modelsPath)
        } else {
          throw err
        }
      }

      const templatePath = path.join(__dirname, '..', '..', 'templates', 'model.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      await fs.writeFile(path.join(modelsPath, `${modelName}.js`), ejs.render(template, { modelName }))

      console.log(chalk.green(`✔ Model "${modelName}.js" created in module "${moduleName}" successfully!`))
    }
  }
}
