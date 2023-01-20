const request = require("supertest")
const app = require("../app")

const User = require("../models/User")
const sequelize = require("../config/database")

beforeAll(() => {
  return sequelize.sync()
})

beforeEach(() => {
  return User.destroy({ truncate: true })
})

const validUser = {
  username: "LudwigWittgenstein",
  email: "ludwig@wittgenstein.com",
  password: "russellisawesome",
}

const postUser = (user = validUser) => request(app).post("/sign-up").send(user)

describe("users /sign-up", () => {
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
})
