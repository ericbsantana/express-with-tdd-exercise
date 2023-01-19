const express = require("express")
const userService = require("../services/user.service")
const router = express.Router()

const validateUsername = (req, res, next) => {
  const user = req.body

  if (!user.username) {
    return res.status(400).send({
      errors: {
        username: "Username can't be null",
      },
    })
  }

  next()
}

const validateEmail = (req, res, next) => {
  const user = req.body

  if (!user.email) {
    return res.status(400).send({
      errors: {
        email: "Email can't be null",
      },
    })
  }

  next()
}

router.post("/sign-up", validateUsername, validateEmail, async (req, res) => {
  await userService.save(req)
  return res.status(200).send({ message: "User created" })
})

module.exports = router
