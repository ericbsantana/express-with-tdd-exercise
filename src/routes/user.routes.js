const express = require("express")
const userService = require("../services/user.service")
const router = express.Router()
const { check, validationResult } = require("express-validator")

router.get("/auth/:token", async (req, res) => {
  try {
    await userService.activateAccount({ token: req.params.token })
    return res.status(200).send({ message: "Account activated" })
  } catch (err) {
    return res.status(400).send({ message: err.message })
  }
})

router.get("/users", async (req, res) => {
  const users = await userService.getUsers()
  return res.send(users)
})

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
    .withMessage("Invalid e-mail")
    .custom(async (email) => {
      const user = await userService.findOne({ email })
      if (user) {
        throw new Error("E-mail already exists")
      }
    }),
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

    try {
      await userService.save(req)
      return res.status(200).send({ message: "User created" })
    } catch (err) {
      return res.status(502).send({ message: err.message })
    }
  }
)

module.exports = router
