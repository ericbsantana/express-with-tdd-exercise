const transporter = require("../config/email")

const sendMail = async ({
  from = "Express With TDD <express@tdd.com>",
  to,
  subject,
  html,
}) =>
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  })

const sendActivateAccountEmail = async ({ token, to }) => {
  await sendMail({
    subject: "Activate your account",
    html: `
    <div>
      <div>
        Click the link below to activate your account:
      </div>
      <div>
        <a href="http://localhost:3000/auth/${token}">Activate account</a>
      </div>
    </div>
    `,
    to,
  })
}

module.exports = { sendActivateAccountEmail }
