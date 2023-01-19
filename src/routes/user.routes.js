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

router.post("/sign-up", validateUsername, async (req, res) => {
  await userService.save(req)
  return res.status(200).send({ message: "User created" })
})

module.exports = router
