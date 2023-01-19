const User = require("../models/User")
const bcrypt = require("bcrypt")

const save = async (req) => {
  const hash = await bcrypt.hash(req.body.password, 8)

  const user = {
    ...req.body,
    password: hash,
  }

  await User.create(user)
}

module.exports = { save }
