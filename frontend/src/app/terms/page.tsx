"use client"

import React from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Пользовательское соглашение (оферта) сервиса «The Slate»
          </h1>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                1. Предмет соглашения
              </h2>
              <p>
                <strong>1.1.</strong> Владелец сервиса [Ваше ФИО] (далее — Владелец)
                предоставляет Пользователю право использования облачного сервиса «The
                Slate» для планирования и учета тренировок.
              </p>
              <p>
                <strong>1.2.</strong> Использование Сервиса допускается только на условиях
                настоящего Соглашения. Регистрация в Сервисе является полным и
                безоговорочным принятием (акцептом) настоящей оферты.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                2. Особенности режима «Бета-тестирования»
              </h2>
              <p>
                <strong>2.1.</strong> Пользователь уведомлен, что на текущем этапе Сервис
                находится в режиме открытого бета-тестирования.
              </p>
              <p>
                <strong>2.2.</strong> Функционал предоставляется по принципу «КАК ЕСТЬ»
                (AS IS). Владелец не гарантирует безошибочную работу Сервиса и не несет
                ответственности за временную недоступность данных или сбои в логике
                приложения.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                3. Интеллектуальная собственность
              </h2>
              <p>
                <strong>3.1.</strong> Исключительное право на Сервис (программный код,
                интерфейс, алгоритмы обработки данных) принадлежит Владельцу.
              </p>
              <p>
                <strong>3.2.</strong> Пользователю предоставляется простая
                (неисключительная) лицензия на использование интерфейса Сервиса в личных
                или профессиональных (для тренеров) целях.
              </p>
              <p>
                <strong>3.3.</strong> Любое копирование кода, реверс-инжиниринг или
                копирование уникальных элементов дизайна «The Slate» запрещено.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                4. Дисклеймер (Отказ от ответственности за здоровье)
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <p className="font-semibold text-yellow-800">
                  <strong>4.1. ВНИМАНИЕ:</strong> Сервис «The Slate» является
                  исключительно информационным инструментом для учета физической
                  активности.
                </p>
              </div>
              <p>
                <strong>4.2.</strong> Владелец не дает медицинских рекомендаций.
                Пользователь самостоятельно оценивает состояние своего здоровья и несет
                полную ответственность за любые травмы или ущерб, полученные в ходе
                выполнения тренировок.
              </p>
              <p>
                <strong>4.3.</strong> Тренер, использующий Сервис для ведения атлетов,
                несет персональную ответственность за квалификацию составляемых им
                программ.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                5. Правила использования чата и обмена данными
              </h2>
              <p>
                <strong>5.1.</strong> В рамках функционала чата запрещено распространение
                спама, вредоносных ссылок, оскорблений и контента, нарушающего
                законодательство РФ.
              </p>
              <p>
                <strong>5.2.</strong> Владелец оставляет за собой право блокировать
                аккаунты при нарушении этических норм или попытках взлома Сервиса.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                6. Изменение условий и контакты
              </h2>
              <p>
                <strong>6.1.</strong> Владелец вправе изменять условия Соглашения в
                одностороннем порядке.
              </p>
              <p>
                <strong>6.2.</strong> По всем вопросам: [Ваш Email].
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
              Последнее обновление:{" "}
              {new Date().toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
