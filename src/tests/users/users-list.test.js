const request = require("supertest")
const app = require("../../app")

describe("User listing", () => {
  describe("GET /users", () => {
    it("should return 200 if no user is on database", async () => {
      const response = await request(app).get("/users")
      expect(response.status).toBe(200)
    })
  })
})
