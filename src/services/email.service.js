const transporter = require("../config/email")

const sendMail = async ({
  from = "Express With TDD <express@tdd.com>",
  to,
  subject,
  html,
}) => {
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
