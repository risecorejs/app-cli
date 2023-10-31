const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define(
    'Migration',
    {
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      tableName: 'migrations',
      updatedAt: false
    }
  )
}
