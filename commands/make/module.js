const ora = require('ora')
const path = require('path')
const fs = require('fs/promises')

const makeServiceCommand = require('./service')
const makeControllerCommand = require('./controller')
const makeModelCommand = require('./model')
const { checkFileUniqueness } = require('../../lib/utils')

module.exports = {
  command: 'make:module [name]',
  describe: 'Generate a new module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Module name', demandOption: true, type: 'string' })
    yargs.option('service', { alias: 's', describe: 'Generate a service', type: 'boolean' })
    yargs.option('controller', { alias: 'c', describe: 'Generate a controller', type: 'boolean' })
    yargs.option('model', { alias: 'm', describe: 'Generate a model', type: 'string' })

    yargs.example([
      ['$0 make:module users'],
      ['$0 make:module --name users'],
      ['$0 make:module --name users --service --controller --model User']
    ])

    return yargs
  },
  async handler({ name: moduleName, service, controller, model }) {
    const spinner = ora('Generating module...').start()

    const modulesPath = path.resolve('modules')
    const modulePath = path.join(modulesPath, moduleName)

    try {
      await fs.access(modulesPath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(modulesPath)
      } else {
        throw err
      }
    }

    await checkFileUniqueness(modulePath, `Module '${moduleName}' already exists!`, spinner)

    await fs.mkdir(modulePath)

    spinner.succeed(`Module '${moduleName}' created successfully!`)

    if (service) {
      await makeServiceCommand.handler({
        module: moduleName
      })
    }

    if (controller) {
      await makeControllerCommand.handler({
        module: moduleName
      })
    }

    if (model) {
      await makeModelCommand.handler({
        module: moduleName,
        name: model
      })
    }
  }
}
