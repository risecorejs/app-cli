const fs = require('fs/promises')
const chalk = require('chalk')

module.exports = {
  checkModuleExists
}

/**
 * Check module exists
 * @param modulePath {string}
 * @returns {Promise<boolean>}
 */
async function checkModuleExists(modulePath) {
  try {
    await fs.access(modulePath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(chalk.red('✖ Module not found, first create a module!'))

      return false
    } else {
      throw err
    }
  }

  return true
}
