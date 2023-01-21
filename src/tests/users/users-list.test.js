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
const addUsers = async ({ verifiedAccounts = 0, unverifiedAccounts = 0 }) => {
  for (let i = 1; i < verifiedAccounts + unverifiedAccounts; i++) {
    await User.create({
      username: `philosopher${i}`,
      email: `philosopher${i}@phi.com`,
      password: `ilovemathtoo`,
      verified: i >= unverifiedAccounts,
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

    it("should return 10 verified users in page content when there are 11 users in database", async () => {
      await addUsers({ verifiedAccounts: 11 })
      const response = await getUsers()
      expect(response.body.data.length).toBe(10)
    })

    it("should return 6 verified users in page content when there are 6 verified users and 5 unverified users", async () => {
      await addUsers({ unverifiedAccounts: 5, verifiedAccounts: 6 })
      const response = await getUsers()
      expect(response.body.data.length).toBe(6)
    })
  })
})
