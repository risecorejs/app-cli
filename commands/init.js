const axios = require('axios')
const ora = require('ora')
const fsPromises = require('fs/promises')
const path = require('path')
const fs = require('fs')
const unzipper = require('unzipper')
const fse = require('fs-extra')

module.exports = {
  command: 'init [dist]',
  describe: 'Initializing the Project',
  builder(yargs) {
    yargs.option('dist', {
      alias: 'd',
      describe: 'Path to the directory for extracting files',
      type: 'string',
      default: '.'
    })

    yargs.example([['$0 init my-app'], ['$0 init --dist my-app']])

    return yargs
  },
  async handler({ dist }) {
    const spinner = ora('Initializing project...').start()

    try {
      const response = await axios.get('https://github.com/risecorejs/app-template/archive/main.zip', {
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

      spinner.succeed('Project has been successfully initialized!')
    } catch (err) {
      spinner.fail('Error occurred while initializing the project!\n')
      console.error(err)
    }
  }
}
