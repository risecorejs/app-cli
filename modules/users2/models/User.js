const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {
    static relations(models) {
      // Define relationships with other models here
      // Example:
      // this.belongsTo(models.AnotherModel, { foreignKey: 'anotherModelId' })
    }
  }

  User.init(
    {
      // Define your model attributes here
      // Example:
      // name: {
      //   type: DataTypes.STRING,
      //   allowNull: false
      // },
      // age: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0
      // }
    },
    {
      sequelize,
      autoMigrations: true,
      tableTable: 'your_table_name', // Specify the table name for your model
      // paranoid: true
    }
  )

  return User
}
