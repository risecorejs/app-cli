const fs = require('fs/promises')
const chalk = require('chalk')

module.exports = {
  checkModuleExists
}

/**
 * Check module exists
 *
 * @param modulePath {string}
 * @param moduleName {string}
 *
 * @returns {Promise<boolean>}
 */
async function checkModuleExists(modulePath, moduleName) {
  try {
    await fs.access(modulePath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`${chalk.red('✖')} Module '${moduleName}' not found!`)

      return false
    } else {
      throw err
    }
  }

  return true
}
