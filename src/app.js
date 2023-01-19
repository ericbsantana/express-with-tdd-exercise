const express = require("express")
const User = require("./models/User")
const app = express()

app.use(express.json())

app.post("/sign-up", (req, res) => {
  User.create(req.body).then(() => {
    return res.status(200).send({ message: "User created" })
  })
})

module.exports = app
