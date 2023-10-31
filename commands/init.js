const axios = require('axios')
const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path')
const unzipper = require('unzipper')

module.exports = {
  command: 'init [dist]',
  describe: 'Initialize a project from a remote repository',
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

      await fsPromises.unlink(archivePath)

      console.log('Repository successfully extracted to the specified directory:', dist)
    } catch (error) {
      console.error('Error while downloading and extracting the repository:', error)
    }
  }
}
