const express = require("express")

const app = express()

app.post("/sign-up", (req, res) => {
  return res.status(200).send({ message: "User created" })
})

module.exports = app
