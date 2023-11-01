const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')

const { checkModuleExists, checkFileUniqueness } = require('../../lib/utils')

module.exports = {
  command: 'make:middleware [name]',
  describe: 'Generate a middleware in a module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Model name', demandOption: true, type: 'string' })
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:middleware auth --module auth'], ['$0 make:middleware --name auth --module auth']])

    return yargs
  },
  async handler({ module: moduleName, name: middlewareName }) {
    const spinner = ora('Generating middleware...').start()

    const modulePath = path.resolve('modules', moduleName)

    await checkModuleExists(modulePath, moduleName, spinner)

    const middlewarePath = path.join(modulePath, 'middleware')
    const middlewareFilename = `${middlewareName}.middleware.js`
    const middlewareFilepath = path.join(middlewarePath, middlewareFilename)

    await checkFileUniqueness(
      middlewareFilepath,
      `Middleware '${middlewareFilename}' already exists in module '${moduleName}'!`,
      spinner
    )

    try {
      await fs.access(middlewarePath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(middlewarePath)
      } else {
        throw err
      }
    }

    const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', 'middleware.ejs')

    const template = await fs.readFile(templatePath, 'utf-8')

    const renderedTemplate = ejs.render(template)

    await fs.writeFile(middlewareFilepath, renderedTemplate)

    spinner.succeed(`Middleware '${middlewareFilename}' created in module '${moduleName}' successfully!`)
  }
}
