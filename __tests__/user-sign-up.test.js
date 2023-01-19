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

describe("user sign up", () => {
  it("should return 200 OK when sign up is valid", (done) => {
    request(app)
      .post("/sign-up")
      .send({
        username: "LudwigWittgenstein",
        email: "ludwig@wittgenstein.com",
        password: "russellisawesome",
      })
      .expect(200)
      .end(done)
  })

  it("should return success message when sign up is valid", (done) => {
    request(app)
      .post("/sign-up")
      .send({
        username: "LudwigWittgenstein",
        email: "ludwig@wittgenstein.com",
        password: "russellisawesome",
      })
      .expect((response) => expect(response.body.message).toBe("User created"))
      .end(done)
  })

  it("should save the user to the database", (done) => {
    request(app)
      .post("/sign-up")
      .send({
        username: "LudwigWittgenstein",
        email: "ludwig@wittgenstein.com",
        password: "russellisawesome",
      })
      .then(() => {
        User.findAll().then((userList) => {
          expect(userList.length).toBe(1)
          done()
        })
      })
  })

  it("should save the username and email to the database", (done) => {
    request(app)
      .post("/sign-up")
      .send({
        username: "LudwigWittgenstein",
        email: "ludwig@wittgenstein.com",
        password: "russellisawesome",
      })
      .then(() => {
        User.findAll().then((userList) => {
          const savedUser = userList[0]
          expect(savedUser.username).toBe("LudwigWittgenstein")
          expect(savedUser.email).toBe("ludwig@wittgenstein.com")
          done()
        })
      })
  })

  it("should hash the user password", (done) => {
    request(app)
      .post("/sign-up")
      .send({
        username: "LudwigWittgenstein",
        email: "ludwig@wittgenstein.com",
        password: "russellisawesome",
      })
      .then(() => {
        User.findAll().then((userList) => {
          const savedUser = userList[0]
          expect(savedUser.password).not.toBe("russellisawesome")
          done()
        })
      })
  })
})
