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

const getUsers = async () => request(app).get("/users")
const addUsers = async (count) => {
  for (let i = 1; i < count; i++) {
    await User.create({
      username: `philosopher${i}`,
      email: `philosopher${i}@phi.com`,
      password: `ilovemathtoo`,
    })
  }
}

describe("User listing", () => {
  describe("GET /users", () => {
    it("should return 200 if no user is on database", async () => {
      const response = await getUsers()
      expect(response.status).toBe(200)
    })

    it("should return page object as response body", async () => {
      const response = await getUsers()
      expect(response.body).toEqual({
        data: [],
        page: 0,
        size: 10,
        totalPages: 0,
      })
    })

    it("should return 10 users in page content when there are 11 users in database", async () => {
      await addUsers(11)
      const response = await getUsers()
      expect(response.body.data.length).toBe(10)
    })
  })
})
