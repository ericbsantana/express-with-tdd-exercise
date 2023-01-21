const nodemailer = require("nodemailer")
const nodemailerStub = require("nodemailer-stub")

const sendMail = async ({
  from = "Express With TDD <express@tdd.com>",
  to,
  subject,
  html,
}) => {
  const transporter = nodemailer.createTransport(nodemailerStub.stubTransport)

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  })
}

const sendActivateAccountEmail = async ({ token, to }) => {
  await sendMail({
    subject: "Activate your account",
    html: `Your token is ${token}`,
    to,
  })
}

module.exports = { sendActivateAccountEmail }
