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

describe("users /sign-up", () => {
  const validUserSend = () =>
    request(app).post("/sign-up").send({
      username: "LudwigWittgenstein",
      email: "ludwig@wittgenstein.com",
      password: "russellisawesome",
    })

  it("should return 200 OK when sign up is valid", (done) => {
    validUserSend().expect(200).end(done)
  })

  it("should return success message when sign up is valid", async () => {
    const response = await validUserSend()
    expect(response.body.message).toBe("User created")
  })

  it("should save the user to the database", async () => {
    await validUserSend()
    const users = await User.findAll()
    expect(users.length).toBe(1)
  })

  it("should save the username and email to the database", async () => {
    await validUserSend()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.username).toBe("LudwigWittgenstein")
    expect(savedUser.email).toBe("ludwig@wittgenstein.com")
  })

  it("should hash the user password", async () => {
    await validUserSend()
    const users = await User.findAll()
    const savedUser = users[0]
    expect(savedUser.password).not.toBe("russellisawesome")
  })
})
