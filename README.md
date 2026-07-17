# ThinkRed Economic Simulator

Историческая экономическая стратегия-симулятор для обучения марксистской политэкономии с полной интеграцией в Stepik.

## Обзор проекта

ThinkRed - это образовательная игра, которая позволяет игрокам управлять предприятиями в разные исторические эпохи, от феодализма до коммунизма, изучая на практике основы марксистской политэкономии.

### Ключевые особенности

- **Исторические эпохи**: Пройдите через 7 исторических периодов от феодализма до коммунизма
- **Управление предприятиями**: Создавайте и управляйте мануфактурами, фабриками, шахтами
- **Экономические решения**: Принимайте решения и наблюдайте за их последствиями
- **Интеграция со Stepik**: Полная синхронизация с курсами Stepik для обучения
- **Марксистская экономика**: Изучайте прибавочную стоимость, норму прибыли, концентрацию капитала

## Архитектура

### Технологический стек

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Phaser.js
- **Backend**: Node.js + Express + TypeScript
- **Database**: sql.js (SQLite, файл `thinkred.db`)
- **Authentication**: Stepik OAuth 2.0 + JWT
- **API**: RESTful + WebSocket (scaffold)

### Структура проекта

```
thinkred-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   ├── contexts/       # React контексты
│   │   ├── game/           # Phaser.js сцены и карта
│   │   ├── services/       # API сервисы
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API роуты
│   │   ├── services/       # Бизнес-логика
│   │   ├── models/         # Модели данных
│   │   └── database/       # sql.js схема
│   └── package.json
├── shared/                 # Shared types и константы
└── docs/                   # Документация
```

## Быстрый старт

### Предварительные требования

- Node.js 18+
- Stepik OAuth credentials (опционально для dev-режима)

### Установка

1. **Клонирование репозитория**
   ```bash
   git clone <repository-url>
   cd thinkred-game
   ```

2. **Установка зависимений**
   ```bash
   # Клиентские зависимости
   cd client
   npm install
   
   # Серверные зависимости
   cd ../server
   npm install
   ```

3. **Настройка переменных окружения**
   ```bash
   cd server
   cp .env.example .env
   ```

   Ключевые переменные в `server/.env`:
   ```env
   JWT_SECRET=your-secret
   STEPIK_CLIENT_ID=...
   STEPIK_CLIENT_SECRET=...
   STEPIK_REDIRECT_URI=http://localhost:3000/auth/callback
   STEPIK_COURSE_ID=12345
   STEPIK_LESSON_MAP={"lesson_1":111,"lesson_2":112,...}
   DATABASE_PATH=./thinkred.db
   ```

4. **Запуск приложения**
   ```bash
   # Запуск сервера (в терминале 1)
   cd server
   npm run dev
   
   # Запуск клиента (в терминале 2)
   cd client
   npm run dev
   ```

5. **Открытие приложения**
   - Клиент: http://localhost:3000
   - Демо-вход (dev): http://localhost:3001/auth/dev-login
   - Сервер API: http://localhost:3001
   - Карта предприятий (Phaser): http://localhost:3000/map

## Игровые механики

### Предприятия

- **Мануфактура**: Базовое производство ручного труда
- **Фабрика**: Машинное производство, высокая производительность
- **Шахта**: Добыча сырья
- **Ферма**: Сельскохозяйственное производство
- **Магазин**: Торговля и реализация продукции
- **Исследовательский центр**: Технологическое развитие

### Экономические показатели

- **Прибыль**: Разница между доходами и издержками
- **Прибавочная стоимость**: Марксистский показатель эксплуатации
- **Норма прибыли**: Отношение прибыли к капиталу
- **Концентрация капитала**: Уровень монополизации рынка

### Исторические эпохи

1. **Феодализм** (1500-1750): Ранние формы капитала
2. **Ранний капитализм** (1750-1850): Мануфактуры и торговля
3. **Промышленная революция** (1850-1900): Фабрики и машины
4. **Монополистический капитализм** (1900-1950): Тресты и монополии
5. **Современный капитализм** (1950-2000): Глобализация
6. **Переход к социализму** (2000-2050): Социальные преобразования
7. **Коммунизм** (2050+): Коммунистическое общество

## Интеграция со Stepik

### OAuth аутентификация

1. Создайте OAuth-приложение на [Stepik](https://stepik.org)
2. Укажите `redirect_uri`: `http://localhost:3000/auth/callback`
3. Добавьте `STEPIK_CLIENT_ID` и `STEPIK_CLIENT_SECRET` в `.env`
4. OAuth-токены сохраняются в таблице `stepik_tokens` и автоматически обновляются

### Гейтинг контента

Типы предприятий разблокируются по прохождению уроков Stepik (`unlockConditions` в `shared/constants/game.ts`).  
Настройте соответствие уроков через `STEPIK_LESSON_MAP` в `.env`.

### API интеграция

- **Прогресс-трекинг**: Синхронизация игровых достижений с прогрессом в курсах
- **Разблокировка контента**: Доступ к новым урокам зависит от игрового прогресса
- **Экспорт результатов**: Отправка игровых решений для анализа

## Разработка

### Скрипты

```bash
# Клиентские скрипты
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run preview      # Предпросмотр сборки
npm run lint         # ESLint проверка

# Серверные скрипты
npm run dev          # Запуск dev сервера с hot reload
npm run build        # Сборка TypeScript
npm run start        # Запуск production сервера
npm run test         # Запуск тестов
npm run migrate      # Миграции базы данных
```

### Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск конкретного тестового файла
npm test -- auth.test.ts
```

### Линтинг

```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix
```

## API документация

### Аутентификация

- `GET /auth/stepik` - Перенаправление на Stepik OAuth
- `GET /auth/stepik/callback` - OAuth callback
- `GET /auth/verify` - Проверка токена
- `POST /auth/logout` - Выход

### Игровые эндпоинты

- `GET /api/game/state` - Получение состояния игры
- `GET /api/game/enterprises` - Получение предприятий
- `POST /api/game/enterprises` - Создание предприятия
- `PUT /api/game/enterprises/:id` - Обновление предприятия
- `POST /api/game/enterprises/:id/decisions` - Принятие решения
- `GET /api/game/events` - Получение событий
- `POST /api/game/events/:id/respond` - Ответ на событие

### Stepik интеграция

- `GET /api/stepik/course` - Структура курса и пройденные уроки
- `GET /api/stepik/completed-lessons` - Список пройденных уроков
- `POST /api/stepik/sync-progress` - Синхронизация прогресса

## Развертывание

### Production

1. **Сборка приложения**
   ```bash
   # Сборка клиента
   cd client
   npm run build
   
   # Сборка сервера
   cd ../server
   npm run build
   ```

2. **Настройка production переменных**
   ```bash
   NODE_ENV=production
   DATABASE_PATH=/data/thinkred.db
   JWT_SECRET=super-secure-secret
   STEPIK_CLIENT_ID=...
   STEPIK_CLIENT_SECRET=...
   ```

3. **Запуск production сервера**
   ```bash
   npm start
   ```

### Docker

```dockerfile
# Dockerfile (будет добавлен позже)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

MIT License - см. LICENSE файл для деталей

## Контакты

- Проект: ThinkRed Economic Simulator
- Цель: Образовательная игра по марксистской политэкономии
- Интеграция: Stepik образовательная платформа

## Дорожная карта

### MVP (текущая версия)
- [x] Базовая архитектура
- [x] Аутентификация через Stepik
- [x] Управление предприятиями
- [x] Экономические расчеты
- [x] Система событий
- [x] Базовый UI

### Версия 1.1 (реализовано)
- [x] Визуализация на Phaser.js (страница `/map`)
- [x] Интеграция Stepik: хранение токенов, гейтинг уроков
- [x] Система событий с сохранением выборов
- [x] Графики экономических показателей

### Версия 1.2 (планируется)
- [ ] AI ассистент для принятия решений
- [ ] Продвинутая аналитика
- [ ] Мобильное приложение
- [ ] Интеграция с другими образовательными платформами

---

**ThinkRed Economic Simulator** - Пойми капитализм. Построй стратегию. Измени взгляд на мир.
