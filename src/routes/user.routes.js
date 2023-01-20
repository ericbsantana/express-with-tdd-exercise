const express = require("express")
const userService = require("../services/user.service")
const router = express.Router()
const { check, validationResult } = require("express-validator")

router.post(
  "/sign-up",
  check("username")
    .notEmpty()
    .withMessage("Username can't be null")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Must have at least 4 characters"),
  check("email")
    .notEmpty()
    .withMessage("Email can't be null")
    .bail()
    .isEmail()
    .withMessage("Invalid e-mail"),
  check("password").notEmpty().withMessage("Password can't be null"),
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
