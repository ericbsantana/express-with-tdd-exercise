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

    it("should return only id, username and email in content array for users", async () => {
      await addUsers({ verifiedAccounts: 2 })
      const response = await getUsers()
      const user = response.body.data[0]
      expect(Object.keys(user)).toEqual(["id", "username", "email"])
    })

    it("should return 2 totalPages when there are 15 active and 7 inactive users", async () => {
      await addUsers({ verifiedAccounts: 15, unverifiedAccounts: 7 })
      const response = await getUsers()
      expect(response.body.totalPages).toBe(2)
    })

    it("should return second page users and page indicator", async () => {
      await addUsers({ verifiedAccounts: 12 })
      const response = await request(app).get("/users").query({ page: 1 })
      expect(response.body.data[0].username).toBe("philosopher11")
      expect(response.body.page).toBe(1)
    })

    it("should return first page when page is below zero", async () => {
      await addUsers({ verifiedAccounts: 12 })
      const response = await request(app).get("/users").query({ page: -5 })
      expect(response.body.page).toBe(0)
    })

    it("should 5 users and corresponding size indicator when size is set to 5", async () => {
      await addUsers({ verifiedAccounts: 11 })
      const response = await request(app).get("/users").query({ size: 5 })
      expect(response.body.data.length).toBe(5)
      expect(response.body.size).toBe(5)
    })

    it("should return 10 users and corresponding size as 1000 ", async () => {
      await addUsers({ verifiedAccounts: 11 })
      const response = await request(app).get("/users").query({ size: 1000 })
      expect(response.body.data.length).toBe(10)
      expect(response.body.size).toBe(10)
    })

    it("should return 10 users and corresponding size as 0 ", async () => {
      await addUsers({ verifiedAccounts: 11 })
      const response = await request(app).get("/users").query({ size: 0 })
      expect(response.body.data.length).toBe(10)
      expect(response.body.size).toBe(10)
    })

    it("should return page = 0 and size = 10 when non numeric query parameter provided", async () => {
      await addUsers({ verifiedAccounts: 11 })
      const response = await request(app)
        .get("/users")
        .query({ size: "lala", page: "lalala" })
      expect(response.body.page).toBe(0)
      expect(response.body.size).toBe(10)
    })
  })
})
