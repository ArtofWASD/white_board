// Тестовый скрипт для проверки бэкенда API обновления профиля
async function testBackendProfileUpdate() {
  try {
    console.log("Testing backend profile update API...")

    // Замените на реальный ID пользователя
    const userId = "ваш_идентификатор_пользователя"
    const apiUrl = "http://localhost:3003/auth/profile/" + userId

    console.log("Sending request directly to backend:", apiUrl)

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

testBackendProfileUpdate()
