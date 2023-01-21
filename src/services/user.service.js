const User = require("../models/User")
const bcrypt = require("bcrypt")

const save = async (req) => {
  const { username, email } = req.body
  const hash = await bcrypt.hash(req.body.password, 8)

  const user = {
    username,
    email,
    password: hash,
  }

  await User.create(user)
}

const findOne = async (fields) => {
  return User.findOne({ where: fields })
}

module.exports = { save, findOne }
