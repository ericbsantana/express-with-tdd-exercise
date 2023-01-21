const Sequelize = require("sequelize")
const sequelize = require("../config/database")

const Model = Sequelize.Model

class User extends Model {}

User.init(
  {
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, modelName: "user" }
)

module.exports = User
