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

  it("should return 'Username can't be null' when username is null", async () => {
    const response = await postUser({
      username: null,
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    })
    const body = response.body
    expect(body.errors.username).toBe("Username can't be null")
  })

  it("should return 'Email can't be null' when email is null", async () => {
    const response = await postUser({
      username: "LudwigWittgenstein",
      email: null,
      password: "russellisawesome",
    })
    const body = response.body
    expect(body.errors.email).toBe("Email can't be null")
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
})
