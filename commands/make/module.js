const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')

const makeServiceCommand = require('./service')
const makeControllerCommand = require('./controller')
const makeModelCommand = require('./model')

module.exports = {
  command: 'make:module [name]',
  describe: 'Create a new module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Module name', demandOption: true, type: 'string' })
    yargs.option('service', { alias: 's', describe: 'Generate a service', type: 'boolean' })
    yargs.option('controller', { alias: 'c', describe: 'Generate a controller', type: 'boolean' })
    yargs.option('model', { alias: 'm', describe: 'Generate a model', type: 'string' })

    yargs.example([
      ['$0 make:module --name auth'],
      ['$0 make:module --name auth'],
      ['$0 make:module --name users --service --controller --model User']
    ])

    return yargs
  },
  async handler({ name: moduleName, service, controller, model }) {
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

    try {
      await fs.access(modulePath)

      console.error(chalk.red(`✖ Module "${moduleName}" already exists!`))

      return
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }

    await fs.mkdir(modulePath)

    console.log(chalk.green(`✔ Module "${moduleName}" created successfully!`))

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
