const fs = require('fs/promises')
const chalk = require('chalk')

module.exports = {
  checkModuleExists,
  checkFileUniqueness,
  checkDirectoryExists,
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
 * Check file uniqueness
 *
 * @param filepath {string}
 * @param errorMessage {string}
 * @param spinner
 *
 * @returns {Promise<void>}
 */
async function checkFileUniqueness(filepath, errorMessage, spinner) {
  try {
    await fs.access(filepath)

    spinner.fail(errorMessage)

    process.exit(1)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

/**
 * Check directory exists
 *
 * @param folderPath {string}
 * @param errorMessage {string}
 *
 * @returns {Promise<void>}
 */
async function checkDirectoryExists(folderPath, errorMessage) {
  try {
    await fs.access(folderPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      logError(errorMessage)

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
