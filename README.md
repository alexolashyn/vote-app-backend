# Vote App Backend

Це бекенд частина проекту Vote App, створена за допомогою NestJS. Вона надає API для управління голосуваннями та аутентифікацією користувачів.

## Особливості

- **Управління голосуваннями**: Створення та управління голосуваннями.
- **Система голосування**: Користувачі можуть брати участь в голосуваннях і переглядати результати після їхнього завершення.
- **Аутентифікація користувачів**: Аутентифікація через JWT.

## Встановлення

### Передумови

- Node.js (версія 14+)
- PostgreSQL (або інша база даних сумісна з TypeORM)

### Налаштування

1. Клонуйте репозиторій:
   ```bash
   git clone https://github.com/alexolashyn/vote-app-backend.git
   cd vote-app-backend
2. Встановіть залежності:
   ```bash
   npm install
3. Створіть файл .env для змінних середовища. Приклад:
   ```bash
   DATABASE_TYPE=your_database_type
   DATABASE_NAME=yor_database_name
   DATABASE_HOST=your_database_host
   DATABASE_PORT=your_database_port
   DATABASE_USERNAME=your_database_username
   DATABASE_PASSWORD=your_database_password
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=your_expiration_time

4. Запустіть сервер для розробки:
   ```bash
   npm run start:dev
