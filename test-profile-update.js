// Тестовый скрипт для проверки обновления профиля
const testProfileUpdate = async () => {
  try {
    // Здесь нужно заменить на реальный ID пользователя
    const userId = "ваш_идентификатор_пользователя"

    const response = await fetch(`http://localhost:3001/auth/profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        height: 180,
        weight: 75,
      }),
    })

    const data = await response.json()
    console.log("Response status:", response.status)
    console.log("Response data:", data)

    if (response.ok) {
      console.log("Profile updated successfully!")
    } else {
      console.log("Failed to update profile:", data.message)
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

testProfileUpdate()
