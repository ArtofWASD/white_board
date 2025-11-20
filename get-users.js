// Скрипт для получения списка пользователей из базы данных
const { Client } = require("pg")

async function getUsers() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "whiteboard",
  })

  try {
    await client.connect()
    console.log("Connected to database")

    const result = await client.query("SELECT id, name, email, height, weight FROM users")
    console.log("Users in database:")
    console.log(result.rows)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await client.end()
  }
}

getUsers()
