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
  let page = req.query.page ? Number.parseInt(req.query.page) : 0
  let size = req.query.size ? Number.parseInt(req.query.size) : 10

  if (page < 0) {
    page = 0
  }
  if (size > 10) {
    size = 10
  }

  const users = await userService.getUsers({ page, size })
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
