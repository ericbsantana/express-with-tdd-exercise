const User = require("../models/User")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const nodemailerStub = require("nodemailer-stub")

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

  const transporter = nodemailer.createTransport(nodemailerStub.stubTransport)

  await transporter.sendMail({
    from: "Express With TDD <express@tdd.com>",
    to: email,
    subject: "Activate your account",
    html: `Your token is ${token}`,
  })
}

const findOne = async (fields) => {
  return User.findOne({ where: fields })
}

module.exports = { save, findOne }
