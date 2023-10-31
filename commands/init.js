const axios = require('axios')
const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')
const unzipper = require('unzipper')
const fse = require('fs-extra')
const chalk = require('chalk')

module.exports = {
  command: 'init [dist]',
  describe: 'Initialize a project',
  builder(yargs) {
    yargs.option('dist', {
      alias: 'd',
      describe: 'Path to the directory for extracting files',
      type: 'string',
      default: '.'
    })

    yargs.example([['$0 init .'], ['$0 init --dist .']])

    return yargs
  },
  async handler({ dist }) {
    const repositoryUrl = 'https://github.com/risecorejs/app-template/archive/main.zip'

    try {
      const response = await axios.get(repositoryUrl, {
        responseType: 'arraybuffer'
      })

      await fsPromises.mkdir(dist, { recursive: true })

      const archivePath = path.resolve(dist, 'app-template.zip')

      await fsPromises.writeFile(archivePath, response.data)

      await fs
        .createReadStream(archivePath)
        .pipe(unzipper.Extract({ path: dist }))
        .promise()

      const extractedFiles = await fsPromises.readdir(dist)

      const firstSubdirectory = path.join(dist, extractedFiles[0])

      await fse.copy(firstSubdirectory, dist)
      await fse.remove(archivePath)
      await fse.remove(firstSubdirectory)

      console.log(chalk.green(`${chalk.green('✔')} Project has been successfully initialized!`))
    } catch (err) {
      console.error(chalk.red(`${chalk.red('✖')} Error occurred while initializing the project!`))
      console.error(err)
    }
  }
}
