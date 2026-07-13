# 🚀 Быстрый запуск ThinkRed Economic Simulator

## 📋 Что нужно для запуска

### Обязательные требования
- **Node.js 18+** - [Скачать](https://nodejs.org/)
- **Git** - [Скачать](https://git-scm.com/)

### Опциональные требования
- **PostgreSQL 14+** - для полной функциональности
- **Stepik API credentials** - для интеграции с курсами

---

## ⚡ Быстрый запуск (5 минут)

### 1. Клонирование и установка
```bash
# Переход в директорию проекта
cd E:\Hermes\thinkred-game

# Установка зависимостей (автоматически)
.\scripts\quick-setup.ps1
```

### 2. Запуск серверов
```bash
# Терминал 1 - Запуск backend
cd server
npm run dev

# Терминал 2 - Запуск frontend  
cd client
npm run dev
```

### 3. Открытие приложения
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/health

---

## 🛠️ Полная настройка (15 минут)

### Шаг 1: Установка зависимостей
```bash
# Клиентские зависимости
cd client
npm install

# Серверные зависимости  
cd ../server
npm install
```

### Шаг 2: Настройка переменных окружения
```bash
# В директории server/
cp .env.example .env

# Отредактируйте .env файл:
# - STEPIK_CLIENT_ID=your_client_id
# - STEPIK_CLIENT_SECRET=your_client_secret  
# - JWT_SECRET=your_secret_key
# - DATABASE_URL=postgresql://...
```

### Шаг 3: Настройка базы данных (опционально)
```bash
# Создание базы данных
createdb thinkred_game

# Применение миграций
psql -d thinkred_game -f scripts/setup-db.sql
```

### Шаг 4: Запуск
```bash
# Запуск сервера (в терминале 1)
cd server
npm run dev

# Запуск клиента (в терминале 2)  
cd client
npm run dev
```

---

## 🎮 Демонстрация функциональности

### Без аутентификации (демо-режим)
1. Откройте http://localhost:3000
2. Нажмите "Войти через Stepik" 
3. Используйте демо-данные для тестирования

### С реальной интеграцией Stepik
1. **Получите API ключи** на [Stepik OAuth](https://stepik.org/oauth2/applications/)
2. **Добавьте в .env**:
   ```
   STEPIK_CLIENT_ID=your_client_id
   STEPIK_CLIENT_SECRET=your_client_secret
   STEPIK_REDIRECT_URI=http://localhost:3000/auth/callback
   ```
3. **Перезапустите сервер** и войдите через Stepik

---

## 🏗️ Архитектура проекта

```
thinkred-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   ├── contexts/       # React контексты  
│   │   ├── services/       # API сервисы
│   │   └── utils/          # Утилиты
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API роуты
│   │   ├── services/       # Бизнес-логика
│   │   └── middleware/     # Middleware
│   └── package.json
├── shared/                 # Общие типы
├── scripts/                # Скрипты сборки
└── docs/                   # Документация
```

---

## 🔧 Основные команды

### Разработка
```bash
# Клиент
cd client
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run preview      # Предпросмотр сборки

# Сервер
cd server  
npm run dev          # Запуск с hot reload
npm run build        # Сборка TypeScript
npm run start        # Production запуск
```

### Тестирование
```bash
# Запуск тестов
npm test

# С покрытием
npm run test:coverage

# Линтинг
npm run lint
npm run lint:fix
```

---

## 📊 Ключевые возможности MVP

### ✅ Реализовано
- **Аутентификация через Stepik OAuth**
- **Управление предприятиями (6 типов)**
- **Экономическая модель с марксистскими концепциями**
- **7 исторических эпох от феодализма до коммунизма**
- **Система событий и решений**
- **Визуализация экономических показателей**
- **Прогресс-трекинг и достижения**
- **Адаптивный UI для всех устройств**

### 🔄 В разработке
- **2D визуализация на Phaser.js**
- **Мультиплеерный режим**
- **AI ассистент для принятия решений**
- **Мобильная версия**

---

## 🐛 Устранение проблем

### Частые проблемы

#### 1. Порт занят
```bash
# Измените порт в .env файле
PORT=3002
```

#### 2. Ошибка TypeScript
```bash
# Переустановка типов
npm install --save-dev @types/node @types/react @types/express
```

#### 3. Проблемы с PostgreSQL
```bash
# Используйте SQLite для разработки
DATABASE_URL=sqlite:./dev.db
```

#### 4. Stepik OAuth ошибки
```bash
# Проверьте redirect URI в настройках Stepik
# Должен быть: http://localhost:3000/auth/callback
```

### Логирование
```bash
# Просмотр логов сервера
cd server
npm run dev 2>&1 | tee server.log

# Просмотр логов клиента  
cd client
npm run dev 2>&1 | tee client.log
```

---

## 📚 Полезные ресурсы

### Документация
- **README.md** - Полная документация проекта
- **docs/presentation.md** - Презентация проекта
- **API документация** - http://localhost:3001/api/docs

### Скрипты
- **scripts/dev-setup.sh** - Автоматическая настройка
- **scripts/deploy.sh** - Production развертывание
- **scripts/quick-setup.ps1** - Быстрая настройка для Windows

### Конфигурации
- **client/vite.config.ts** - Настройка Vite
- **server/tsconfig.json** - Настройка TypeScript
- **shared/constants/game.ts** - Игровые константы

---

## 🎯 Демонстрационный сценарий

### Сценарий 1: Первое предприятие
1. **Вход** → Дашборд
2. **Создание** → Мануфактура в Манчестере  
3. **Настройка** → 20 рабочих, зарплата $100
4. **Наблюдение** → Прибыль $500, прибавочная стоимость $200
5. **Решение** → Инвестиции в технологии +$1000

### Сценарий 2: Экономический кризис
1. **Событие** → Кризис перепроизводства
2. **Анализ** → Спрос падает на 30%
3. **Выбор** → Сократить производство или диверсифицироваться
4. **Последствия** → Безработица 15%, падение прибыли
5. **Обучение** → Понимание механизмов кризисов

### Сценарий 3: Переход эпохи
1. **Достижение** → Технологический уровень 5.0
2. **Переход** → Промышленная революция
3. **Новые возможности** → Доступ к фабрикам
4. **Интеграция** → Разблокировка уроков Stepik
5. **Развитие** → Создание промышленной империи

---

## 🚀 Production развертывание

### Быстрый деплой
```bash
# Сборка проекта
.\scripts\deploy.sh

# Результат в build/ директории
# - client/ - статические файлы
# - server/ - Node.js приложение
# - docker-compose.yml - Docker конфигурация
```

### Docker развертывание
```bash
# Сборка и запуск
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### PM2 развертывание
```bash
# Установка PM2
npm install -g pm2

# Запуск
cd build/server
pm2 start ecosystem.config.js
```

---

## 📞 Поддержка

### Техническая поддержка
- **Логи**: `logs/` директория
- **Health check**: `/health` эндпоинт
- **API документация**: `/api/docs`

### Обратная связь
- **GitHub Issues**: для баг-репортов
- **Discord**: для обсуждения разработки
- **Email**: для технических вопросов

---

## 🎉 Готово к запуску!

Проект **ThinkRed Economic Simulator** полностью готов к демонстрации:

✅ **MVP завершен** - Все базовые функции работают  
✅ **Интеграция Stepik** - OAuth и синхронизация готовы  
✅ **Документация** - Полная документация и скрипты  
✅ **Развертывание** - Production конфигурации готовы  

**Запускайте и наслаждайтесь!** 🚀

---

*ThinkRed Economic Simulator - Пойми капитализм. Построй стратегию. Измени взгляд на мир.*
