const request = require("supertest")
const SMTPServer = require("smtp-server").SMTPServer
const app = require("../app")

const User = require("../models/User")
const sequelize = require("../config/database")

let lastMail, server
let simulateSMTPError = false

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData: (stream, session, callback) => {
      let mailBody
      stream.on("data", (data) => {
        mailBody += data.toString()
      })

      stream.on("end", () => {
        if (simulateSMTPError) {
          const error = new Error("Failed to deliver e-mail")
          error.responseCode = 553
          return callback(error)
        }
        lastMail = mailBody
        callback()
      })
    },
  })

  await server.listen(7172, "localhost")

  return sequelize.sync()
})

beforeEach(() => {
  simulateSMTPError = false
  return User.destroy({ truncate: true })
})

afterAll(async () => {
  await server.close()
})

const validUser = {
  username: "LudwigWittgenstein",
  email: "ludwig@wittgenstein.com",
  password: "russellisawesome",
}

const postUser = (user = validUser) => request(app).post("/sign-up").send(user)

describe("account creation", () => {
  it("should return 200 OK when sign up is valid", (done) => {
    postUser().expect(200).end(done)
  })

  it("should return success message when sign up is valid", async () => {
    const response = await postUser()
    expect(response.body.message).toBe("User created")
  })

  it("should save the user to the database", async () => {
    await postUser()
    const users = await User.findAll()
    expect(users.length).toBe(1)
  })

  it("should save the username and email to the database", async () => {
    await postUser()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.username).toBe("LudwigWittgenstein")
    expect(savedUser.email).toBe("ludwig@wittgenstein.com")
  })

  it("should hash the user password", async () => {
    await postUser()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.password).not.toBe("russellisawesome")
  })

  it("should return 400 when username is null", async () => {
    const response = await postUser({
      username: null,
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    })

    expect(response.statusCode).toBe(400)
  })

  it("should return errors in response body if there is any", async () => {
    const response = await postUser({
      username: null,
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    })
    const body = response.body
    expect(body.errors).not.toBeUndefined()
  })

  it.each([
    ["username", "Username can't be null"],
    ["email", "Email can't be null"],
    ["password", "Password can't be null"],
  ])("when %s is null return %s message", async (field, expectedMessage) => {
    const user = {
      username: "LudwigWittgenstein",
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    }

    user[field] = null

    const response = await postUser(user)
    const body = response.body
    expect(body.errors[field]).toBe(expectedMessage)
  })

  it("should return errors when username and email are null", async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: "russellisawesome",
    })
    const body = response.body
    expect(Object.keys(body.errors)).toEqual(["username", "email"])
  })

  it("should return size validation error when username has less than 4 characters", async () => {
    const user = {
      username: "abc",
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    }

    const response = await postUser(user)
    const body = response.body
    expect(body.errors.username).toBe("Must have at least 4 characters")
  })

  it("should return email invalid message", async () => {
    const user = {
      username: "LudwigWittgenstein",
      email: "invalidmail",
      password: "russellisawesome",
    }

    const response = await postUser(user)
    const body = response.body
    expect(body.errors.email).toBe("Invalid e-mail")
  })

  it('should return "Email already registered" if email is already registered', async () => {
    await User.create({ ...validUser })
    const response = await postUser()
    const body = response.body
    expect(body.errors.email).toBe("E-mail already exists")
  })

  it("should return errors when username is null and email is already registered", async () => {
    await User.create({ ...validUser })
    const response = await postUser({ ...validUser, username: null })
    const body = response.body
    expect(body.errors.email).toBe("E-mail already exists")
    expect(body.errors.username).toBe("Username can't be null")
  })

  it("should create user unverified", async () => {
    await postUser()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.verified).toBe(false)
  })

  it("should not allow verified field to be in the body", async () => {
    await postUser({ ...validUser, verified: true })
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.verified).toBe(false)
  })

  it("should create user with token", async () => {
    await postUser()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.token).toBeTruthy()
  })

  it("should send an email with activation token", async () => {
    await postUser()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(lastMail).toContain("ludwig@wittgenstein.com")
    expect(lastMail).toContain(savedUser.token)
  })

  it("should return 502 bad gateway if email is not sent", async () => {
    simulateSMTPError = true
    const response = await postUser()
    expect(response.status).toBe(502)
  })

  it("should return email failure message when sending email fails", async () => {
    simulateSMTPError = true
    const response = await postUser()
    expect(response.body.message).toBe("Failed to send e-mail")
  })

  it("should not save user in database when activation email fails", async () => {
    simulateSMTPError = true

    await postUser()
    const users = await User.findAll()

    expect(users.length).toBe(0)
  })
})

describe("account activation", () => {
  it("should activate account if correct token is sent", async () => {
    await postUser()
    const [user] = await User.findAll()

    await request(app).get(`/auth/${user.token}`)

    const [activatedUser] = await User.findAll()
    expect(activatedUser.verified).toBe(true)
  })

  it("should return 404 if nothing is sent to route", async () => {
    const response = await request(app).get(`/auth`)
    expect(response.status).toBe(404)
  })
})
