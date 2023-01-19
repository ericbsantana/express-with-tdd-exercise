const express = require("express")
const User = require("./models/User")
const app = express()
const bcrypt = require("bcrypt")

app.use(express.json())

app.post("/sign-up", (req, res) => {
  bcrypt.hash(req.body.password, 8).then((hash) => {
    const user = {
      ...req.body,
      password: hash,
    }

    User.create(user).then(() => {
      return res.status(200).send({ message: "User created" })
    })
  })
})

module.exports = app
