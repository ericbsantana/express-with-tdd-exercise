const User = require("../models/User")
const bcrypt = require("bcrypt")
const EmailService = require("./email.service")
const { v4: uuid } = require("uuid")
const sequelize = require("../config/database")

const save = async (req) => {
  const { username, email } = req.body
  const hash = await bcrypt.hash(req.body.password, 8)
  const transaction = await sequelize.transaction()

  const user = {
    username,
    email,
    password: hash,
    token: uuid(),
  }

  const createdUser = await User.create(user, { transaction })
  const { token } = await createdUser.toJSON()
  try {
    await EmailService.sendActivateAccountEmail({ to: email, token })
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw new Error("Failed to send e-mail")
  }
}

const findOne = async (fields) => {
  return User.findOne({ where: fields })
}

const activateAccount = async ({ token }) => {
  const userFound = await User.findOne({ where: { token } })
  if (!userFound) {
    throw new Error("Invalid token")
  }
  userFound.verified = true
  userFound.token = false
  await userFound.save()
}

const getUsers = async ({ page, size }) => {
  const limit = size

  const users = await User.findAndCountAll({
    limit,
    offset: page * limit,
    where: {
      verified: true,
    },
    attributes: ["id", "username", "email"],
  })

  const totalPages = Math.ceil(users.count / limit)

  return {
    data: users.rows,
    page,
    size: limit,
    totalPages,
  }
}

module.exports = { save, findOne, activateAccount, getUsers }
