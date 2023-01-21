const User = require("../models/User")
const bcrypt = require("bcrypt")
const EmailService = require("./email.service")

const save = async (req) => {
  const { username, email } = req.body
  const hash = await bcrypt.hash(req.body.password, 8)

  const user = {
    username,
    email,
    password: hash,
  }

  const createdUser = await User.create(user)
  const { token } = await createdUser.toJSON()
  await EmailService.sendActivateAccountEmail({ to: email, token })
}

const findOne = async (fields) => {
  return User.findOne({ where: fields })
}

module.exports = { save, findOne }
