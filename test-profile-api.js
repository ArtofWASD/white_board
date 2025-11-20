// Тестовый скрипт для проверки API обновления профиля
async function testProfileUpdate() {
  try {
    console.log("Testing profile update API...")

    // Используем реальный ID пользователя
    const userId = "39c847e6-c529-476b-acd2-db16da4b7f91"
    // Используем IP-адрес сети WSL
    const apiUrl = "http://172.19.0.1:3000/api/auth/profile/" + userId

    console.log("Sending request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        height: 180,
        weight: 75,
      }),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", response.headers)

    const data = await response.json()
    console.log("Response data:", data)
  } catch (error) {
    console.error("Error:", error)
  }
}

testProfileUpdate()
