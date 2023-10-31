/**
 * Apply changes to the database.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - The Sequelize queryInterface object.
 * @param {import('sequelize').Transaction} transaction - The database transaction object.
 *
 * @returns {Promise<void>}
 */
exports.up = async (queryInterface, transaction) => {
  // Add your migration logic here to make changes to the database.
}

/**
 * Revert the changes made by the `up` method.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - The Sequelize queryInterface object.
 * @param {import('sequelize').Transaction} transaction - The database transaction object.
 *
 * @returns {Promise<void>}
 */
exports.down = async (queryInterface, transaction) => {
  // Add your migration logic here to revert the changes made by the `up` method.
}
