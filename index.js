const app = require("./src/app")
const sequelize = require("./src/config/database")

sequelize.sync({ force: true })

const port = 3000 || process.env.PORT

app.listen(port, () =>
  console.log(
    `App is running on port ${port}. Environment: ${process.env.NODE_ENV}`
  )
)
