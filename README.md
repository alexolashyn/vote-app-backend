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
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USERNAME=your-username
  DATABASE_PASSWORD=your-password
  DATABASE_NAME=vote_app
  JWT_SECRET=your-secret-key
  JWT_EXPIRATION=3600
