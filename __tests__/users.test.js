const request = require("supertest")
const app = require("../src/app")

const User = require("../src/models/User")
const sequelize = require("../src/config/database")

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

  it("should return success message when sign up is valid", (done) => {
    validUserSend()
      .expect((response) => expect(response.body.message).toBe("User created"))
      .end(done)
  })

  it("should save the user to the database", (done) => {
    validUserSend().then(() => {
      User.findAll().then((userList) => {
        expect(userList.length).toBe(1)
        done()
      })
    })
  })

  it("should save the username and email to the database", (done) => {
    validUserSend().then(() => {
      User.findAll().then((userList) => {
        const savedUser = userList[0]
        expect(savedUser.username).toBe("LudwigWittgenstein")
        expect(savedUser.email).toBe("ludwig@wittgenstein.com")
        done()
      })
    })
  })

  it("should hash the user password", (done) => {
    validUserSend().then(() => {
      User.findAll().then((userList) => {
        const savedUser = userList[0]
        expect(savedUser.password).not.toBe("russellisawesome")
        done()
      })
    })
  })
})
