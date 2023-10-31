const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const ejs = require('ejs')

const { checkModuleExists } = require('../../utils')

module.exports = {
  command: 'make:model [name]',
  describe: 'Generate a model in a module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Model name', demandOption: true, type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:model User --module users'], ['$0 make:model --name User --module users']])

    return yargs
  },
  async handler({ module: moduleName, name: modelName }) {
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (moduleExists) {
      const modelsPath = path.join(modulePath, 'models')
      const modelFilename = `${modelName}.js`
      const modelPath = path.join(modelsPath, modelFilename)

      try {
        await fs.access(modelPath)

        console.error(`${chalk.red(`✖`)} Model "${modelFilename}" already exists in module "${moduleName}"!`)

        return
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }

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

      const renderedTemplate = ejs.render(template, { modelName })

      await fs.writeFile(modelPath, renderedTemplate)

      console.log(`${chalk.green(`✔`)} Model "${modelFilename}" created in module "${moduleName}" successfully!`)
    }
  }
}
