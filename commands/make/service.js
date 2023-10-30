const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')

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

    try {
      await fs.access(modulePath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(chalk.red('✖ Module not found, first create a module!'))

        return
      } else {
        throw err
      }
    }

    await fs.writeFile(
      path.join(modulePath, `${moduleName}.service.js`),
      [
        `// modules/${moduleName}/${moduleName}.service.js`,
        '',
        '// This file defines the service for module-related operations.'
      ].join('\n')
    )

    console.log(chalk.green(`✔ Service "${moduleName}.service.js" created in module "${moduleName}" successfully!`))
  }
}
