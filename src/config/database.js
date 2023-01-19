const Sequelize = require("sequelize")

const sequelize = new Sequelize("tdd-lovers", "tdd-user", "tdd-pwd", {
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
})

module.exports = sequelize
