const Sequelize = require("sequelize")
const config = require("config")

const databaseConfig = config.get("database")

const sequelize = new Sequelize(
  databaseConfig.name,
  databaseConfig.username,
  databaseConfig.password,
  {
    dialect: databaseConfig.dialect,
    storage: databaseConfig.storage,
    logging: databaseConfig.logging,
  }
)

module.exports = sequelize
