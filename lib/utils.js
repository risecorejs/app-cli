const fs = require('fs/promises')
const chalk = require('chalk')

module.exports = {
  checkModuleExists,
  logSuccess,
  logError
}

/**
 * Check module exists
 *
 * @param modulePath {string}
 * @param moduleName {string}
 * @param [spinner]
 *
 * @returns {Promise<void>}
 */
async function checkModuleExists(modulePath, moduleName, spinner) {
  try {
    await fs.access(modulePath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      const errorMessage = `Module '${moduleName}' not found!`

      if (spinner) {
        spinner.fail(errorMessage)
      } else {
        logError(errorMessage)
      }

      process.exit(1)
    } else {
      throw err
    }
  }
}

/**
 * Log success
 *
 * @param text {string}
 *
 * @returns {void}
 */
function logSuccess(text) {
  console.log(`${chalk.red('✔')} ${text}`)
}

/**
 * Log error
 *
 * @param text {string}
 *
 * @returns {void}
 */
function logError(text) {
  console.log(`${chalk.red('✖')} ${text}`)
}
