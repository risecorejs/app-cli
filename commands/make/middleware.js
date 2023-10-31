const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const ejs = require('ejs')

const { checkModuleExists } = require('../../utils')

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
    const modulePath = path.resolve('modules', moduleName)

    const moduleExists = await checkModuleExists(modulePath, moduleName)

    if (moduleExists) {
      const middlewarePath = path.join(modulePath, 'middleware')
      const middlewareFilename = `${middlewareName}.middleware.js`
      const middlewareFilepath = path.join(middlewarePath, middlewareFilename)

      try {
        await fs.access(middlewareFilepath)

        console.error(`${chalk.red('✖')} Middleware "${middlewareFilename}" already exists in module "${moduleName}"!`)

        return
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }

      try {
        await fs.access(middlewarePath)
      } catch (err) {
        if (err.code === 'ENOENT') {
          await fs.mkdir(middlewarePath)
        } else {
          throw err
        }
      }

      const templatePath = path.join(__dirname, 'templates', 'middleware.ejs')

      const template = await fs.readFile(templatePath, 'utf-8')

      const renderedTemplate = ejs.render(template)

      await fs.writeFile(middlewareFilepath, renderedTemplate)

      console.log(
        `${chalk.green('✔')} Middleware "${middlewareFilename}" created in module "${moduleName}" successfully!`
      )
    }
  }
}
