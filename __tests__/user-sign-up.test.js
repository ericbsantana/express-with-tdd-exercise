const request = require("supertest")
const app = require("../app")

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
})
