const path = require('path')
const fs = require('fs/promises')
const chalk = require('chalk')
const _ = require('lodash')

module.exports = {
  command: 'make:controller',
  describe: 'Create a controller in a module',
  builder(yargs) {
    yargs.option('module', { alias: 'n', describe: 'Module name', demandOption: true })

    yargs.example([['$0 make:controller --module users ']])

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
      path.join(modulePath, `${moduleName}.controller.js`),
      [
        "const express = require('express')",
        '',
        'const router = express.Router()',
        '',
        `module.exports = ['/${_.kebabCase(moduleName)}', router]`,
        '',
        '// Define routes and controller logic using the service.',
        '// Example:',
        "// router.get('/', async (req, res) => {",
        '//   // Call service methods to handle the request and response.',
        '// })',
        ''
      ].join('\n')
    )

    console.log(
      chalk.green(`✔ Controller "${moduleName}.controller.js" created in module "${moduleName}" successfully!`)
    )
  }
}
