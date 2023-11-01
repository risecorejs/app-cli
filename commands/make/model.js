const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')

const { checkModuleExists, checkFileUniqueness } = require('../../lib/utils')

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
    const spinner = ora('Generating model...').start()

    const modulePath = path.resolve('modules', moduleName)

    await checkModuleExists(modulePath, moduleName, spinner)

    const modelsPath = path.join(modulePath, 'models')
    const modelFilename = `${modelName}.js`
    const modelFilepath = path.join(modelsPath, modelFilename)

    await checkFileUniqueness(
      modelFilepath,
      `Model '${modelFilename}' already exists in module '${moduleName}'!`,
      spinner
    )

    try {
      await fs.access(modelsPath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(modelsPath)
      } else {
        throw err
      }
    }

    const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', 'model.ejs')

    const template = await fs.readFile(templatePath, 'utf-8')

    const renderedTemplate = ejs.render(template, { modelName })

    await fs.writeFile(modelFilepath, renderedTemplate)

    spinner.succeed(`Model '${modelFilename}' created in module '${moduleName}' successfully!`)
  }
}
