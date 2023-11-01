const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')
const ejs = require('ejs')

const { checkModuleExists } = require('../../lib/utils')

module.exports = {
  command: 'make:service',
  describe: 'Generate a service in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'm', describe: 'Module name', demandOption: true, type: 'string' })

    yargs.example([['$0 make:service --module users']])

    return yargs
  },
  async handler({ module: moduleName }) {
    const spinner = ora('Generating service...').start()

    const modulePath = path.resolve('modules', moduleName)

    await checkModuleExists(modulePath, moduleName, spinner)

    const serviceFilename = `${moduleName}.service.js`
    const serviceFilepath = path.join(modulePath, serviceFilename)

    try {
      await fs.access(serviceFilepath)

      spinner.fail(`Service '${serviceFilename}' already exists in module '${moduleName}'!`)

      process.exit(1)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }

    const templatePath = path.join(__dirname, '..', '..', 'lib', 'templates', 'service.ejs')

    const template = await fs.readFile(templatePath, 'utf-8')

    const renderedTemplate = ejs.render(template, { moduleName })

    await fs.writeFile(serviceFilepath, renderedTemplate)

    spinner.succeed(`Service '${serviceFilename}' created in module '${moduleName}' successfully!`)
  }
}
