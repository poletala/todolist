# ToDo List

Приложение позволяет управлять задачами: создавать, редактировать, отслеживать их статус. 
Реализована авторизация пользователей, разделение прав доступа и взаимодействие с сервером через API.

## 🚀 Установка и запуск

npm install
npm run dev

Перейдите на http://localhost:5173

🛠 Используемые технологии и библиотеки

React — библиотека для построения пользовательских интерфейсов.
React Router DOM — маршрутизация в React-приложении.
Axios — HTTP-клиент для работы с API.
React Spinners — библиотека лоадеров.
Socket.IO Client — для работы с WebSocket.
Vite — сборщик и инструмент для разработки.
TypeScript — статическая типизация.
ESLint — линтер для проверки кода.
gh-pages — деплой на GitHub Pages.

📝 Особенности реализации
Авторизация пользователей с разделением прав доступа.
Валидация форм и обработка ошибок.
Использование TypeScript для повышения надежности кода.
Оптимизация производительности с помощью Vite.

## ⚠️ Ограничения
К сожалению, не удалось провести полноценный деплой серверной части проекта по следующим причинам:
1. **Хостинг**: Heroku, который изначально планировался для деплоя, недоступен в моей стране. Попытки использовать VPN также не увенчались успехом. Render не принимал данные карты нашей страны.
2. **База данных**: Использование SQLite в облачном хранилище невозможно из-за отсутствия необходимой платежной системы для регистрации на подходящих платформах.

Несмотря на это, проект полностью функционален в локальной среде. Все API-запросы и WebSocket-соединения работают корректно при запуске сервера на `localhost`.


Разработано с ❤️ для тестового задания.