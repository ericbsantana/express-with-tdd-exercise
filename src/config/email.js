const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 7172,
  tls: {
    rejectUnauthorized: false,
  },
})

module.exports = transporter
