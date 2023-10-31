const path = require('path')
const { Sequelize } = require('sequelize')

const configPath = path.resolve('config')

const config = require(configPath)

const sequelize = new Sequelize(config.database)

module.exports = {
  sequelize,
  Migration: require('./Migration')(sequelize)
}
