const express = require("express")
const userService = require("../services/user.service")
const router = express.Router()
const { check, validationResult } = require("express-validator")

router.post(
  "/sign-up",
  check("username").notEmpty().withMessage("Username can't be null"),
  check("email").notEmpty().withMessage("Email can't be null"),
  async (req, res) => {
    const validationResultErrors = validationResult(req)

    if (!validationResultErrors.isEmpty()) {
      const errors = {}
      validationResultErrors
        .array()
        .forEach((element) => (errors[element.param] = element.msg))

      return res.status(400).send({ errors })
    }

    await userService.save(req)
    return res.status(200).send({ message: "User created" })
  }
)

module.exports = router
