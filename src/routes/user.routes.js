const express = require("express")
const userService = require("../services/user.service")
const router = express.Router()

router.post("/sign-up", async (req, res) => {
  const user = req.body

  if (!user.username) {
    return res.status(400).send()
  }

  await userService.save(req)
  return res.status(200).send({ message: "User created" })
})

module.exports = router
