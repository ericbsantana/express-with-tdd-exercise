const request = require("supertest")
const app = require("../../app")

const User = require("../../models/User")
const sequelize = require("../../config/database")

beforeAll(async () => {
  return sequelize.sync()
})

beforeEach(() => {
  return User.destroy({ truncate: true })
})

describe("User listing", () => {
  describe("GET /users", () => {
    it("should return 200 if no user is on database", async () => {
      const response = await request(app).get("/users")
      expect(response.status).toBe(200)
    })

    it("should return page object as response body", async () => {
      const response = await request(app).get("/users")
      expect(response.body).toEqual({
        data: [],
        page: 0,
        size: 10,
        totalPages: 0,
      })
    })

    it("should return 10 users in page content when there are 11 users in database", async () => {
      for (let i = 0; i < 11; i++) {
        await User.create({
          username: `philosopher${i}`,
          email: `philosopher${i}@phi.com`,
          password: `ilovemathtoo`,
        })
      }
      const response = await request(app).get("/users")
      expect(response.body.data.length).toBe(10)
    })
  })
})
