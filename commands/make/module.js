const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')

const makeServiceCommand = require('./service')
const makeControllerCommand = require('./controller')

module.exports = {
  command: 'make:module',
  describe: 'Create a new module',
  builder(yargs) {
    yargs.option('name', { alias: 'n', describe: 'Module name', demandOption: true, type: 'string' })
    yargs.option('service', { alias: 's', describe: 'Generate a service', type: 'boolean' })
    yargs.option('controller', { alias: 'c', describe: 'Generate a controller', type: 'boolean' })
    yargs.option('model', { alias: 'm', describe: 'Generate a model', type: 'string' })

    yargs.example([['$0 make:module --name auth'], ['$0 make:module --name users --service --controller --model User']])

    return yargs
  },
  async handler({ name, service, controller, model }) {
    const modulesPath = path.resolve('modules')
    const modulePath = path.join(modulesPath, name)

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

      console.error(chalk.red(`✖ Module "${name}" already exists!`))

      return
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }

    await fs.mkdir(modulePath)

    console.log(chalk.green(`✔ Module "${name}" created successfully!`))

    if (service) {
      await makeServiceCommand.handler({ module: name })
    }

    if (controller) {
      await makeControllerCommand.handler({ module: name })
    }
  }
}
