"use client"

import React from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onRightMenuClick={() => {}} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Политика в отношении обработки персональных данных сервиса «The Slate»
          </h1>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                1. Общие положения
              </h2>
              <p>
                <strong>1.1.</strong> Настоящая Политика разработана в соответствии с
                Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
              </p>
              <p>
                <strong>1.2.</strong> Оператором данных является: [Ваше ФИО], e-mail: [Ваш
                Email].
              </p>
              <p>
                <strong>1.3.</strong> Оператор ставит своей важнейшей целью соблюдение
                прав и свобод человека при обработке его персональных данных, в том числе
                защиты прав на неприкосновенность частной жизни.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                2. Перечень обрабатываемых данных
              </h2>
              <p>
                <strong>2.1.</strong> Оператор может обрабатывать следующие данные:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Фамилия, имя (для идентификации в системе);</li>
                <li>Адрес электронной почты (для авторизации и связи);</li>
                <li>
                  Физические параметры: пол, возраст, рост, вес (необходимы для
                  функционала расчета нагрузок);
                </li>
                <li>
                  Данные о спортивной подготовке и результатах тренировок (логи, веса,
                  время выполнения комплексов);
                </li>
                <li>
                  Технические данные: IP-адрес, тип браузера, файлы Cookies (для
                  корректной работы сессий авторизации).
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                3. Цели обработки персональных данных
              </h2>
              <p>
                <strong>3.1.</strong> Предоставление доступа к функционалу SaaS-платформы
                «The Slate».
              </p>
              <p>
                <strong>3.2.</strong> Обеспечение взаимодействия в связке «Тренер —
                Атлет».
              </p>
              <p>
                <strong>3.3.</strong> Визуализация спортивного прогресса пользователя
                через графики и отчеты.
              </p>
              <p>
                <strong>3.4.</strong> Направление уведомлений о новых тренировках,
                событиях или изменениях в работе Сервиса.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                4. Правовые основания и безопасность
              </h2>
              <p>
                <strong>4.1.</strong> Обработка данных осуществляется на основании
                согласия Пользователя, предоставляемого путем регистрации в Сервисе.
              </p>
              <p>
                <strong>4.2.</strong> Оператор обеспечивает конфиденциальность данных.
                Базы данных (PostgreSQL) расположены на серверах провайдера [Укажите
                провайдера, например, Yandex Cloud / Selectel], находящихся на территории
                РФ.
              </p>
              <p>
                <strong>4.3.</strong> Доступ к данным атлета имеет только сам атлет и
                прикрепленный к нему в системе Тренер (в рамках функционала управления
                тренировочным процессом).
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-6">
                5. Порядок сбора, хранения и удаления
              </h2>
              <p>
                <strong>5.1.</strong> Данные обрабатываются до момента удаления аккаунта
                Пользователем или достижения целей обработки.
              </p>
              <p>
                <strong>5.2.</strong> Пользователь может в любой момент отозвать согласие,
                направив запрос на e-mail Оператора.
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
