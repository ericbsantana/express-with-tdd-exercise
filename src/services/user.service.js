const User = require("../models/User")
const bcrypt = require("bcrypt")
const EmailService = require("./email.service")
const { v4: uuid } = require("uuid")

const save = async (req) => {
  const { username, email } = req.body
  const hash = await bcrypt.hash(req.body.password, 8)

  const user = {
    username,
    email,
    password: hash,
    token: uuid(),
  }

  const createdUser = await User.create(user)
  const { token } = await createdUser.toJSON()
  try {
    await EmailService.sendActivateAccountEmail({ to: email, token })
  } catch (err) {
    throw new Error("Failed to send e-mail")
  }
}

const findOne = async (fields) => {
  return User.findOne({ where: fields })
}

module.exports = { save, findOne }
