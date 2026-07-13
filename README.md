# 🏭 ThinkRed Economic Simulator

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Историческая экономическая стратегия-симулятор для обучения марксистской политэкономии.

> **Понять капитализм. Построить стратегию. Изменить взгляд на мир.**

---

## 🎮 Проект ThinkRed

ThinkRed — марксистский образовательный проект. Мы создаём курсы, игры и инструменты для изучения марксизма-ленинизма.

🔗 **Сайт:** [thinkred.ru](https://thinkred.ru) · **Telegram:** [@thinkred_marx](https://t.me/thinkred_marx) · **YouTube:** [@TheThinkRed](https://www.youtube.com/@TheThinkRed)

---

## 🚀 Быстрый старт

### Что нужно установить

1. **Node.js** (версия 18+) — скачать с [nodejs.org](https://nodejs.org/)
2. **Git** — скачать с [git-scm.com](https://git-scm.com/)

### Запуск игры

```bash
# 1. Скачать код
git clone https://github.com/thethinkred-ai/thinkred-game.git
cd thinkred-game

# 2. Установить зависимости
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 3. Запустить сервер (в одном терминале)
cd server && npm run dev

# 4. Запустить клиент (в другом терминале)
cd client && npm run dev
```

Откройте **http://localhost:3000** — игра работает!

> 🔧 Если что-то пошло не так — создайте [Issue](https://github.com/thethinkred-ai/thinkred-game/issues/new) на GitHub.

---

## 🧩 Как устроена игра

Вы управляете предприятиями в разные исторические эпохи и изучаете марксистскую политэкономию на практике.

- **7 эпох:** от феодализма до коммунизма
- **6 типов предприятий:** мануфактура, фабрика, шахта, ферма, магазин, исследовательский центр
- **Экономические показатели:** прибыль, прибавочная стоимость, норма прибыли, концентрация капитала

---

## 🛠 Технологии

| Компонент | Технология |
|-----------|-----------|
| Фронтенд | React 18 + TypeScript + Vite |
| Бэкенд | Node.js + Express + TypeScript |
| База данных | PostgreSQL |
| Аутентификация | Stepik OAuth 2.0 |

---

## 🤝 Как помочь проекту

Мы ищем:
- **Разработчиков** — React, Node.js, TypeScript
- **Дизайнеров** — UI/UX, игровой дизайн
- **Экономистов** — марксистская политэкономия
- **Тестировщиков** — найти баги, предложить идеи
- **Авторов контента** — тексты, сценарии, диалоги

### Пошаговая инструкция для первого Pull Request

1. Зарегистрируйтесь на **GitHub**
2. Зайдите на страницу проекта: https://github.com/thethinkred-ai/thinkred-game
3. Нажмите **Fork** (кнопка справа вверху) — создаётся ваша копия проекта
4. На своей копии нажмите **Code** → скопируйте ссылку
5. В терминале: `git clone <ваша-ссылка>`
6. Сделайте изменения, закоммитьте: `git add . && git commit -m "что сделали"`
7. Отправьте: `git push`
8. На GitHub нажмите **Contribute** → **Open Pull Request**
9. Опишите, что изменили, и нажмите **Create Pull Request**

Готово! Мы увидим ваш PR и обсудим.

---

## 📝 Контакты

- **Чат разработчиков:** [Telegram-группа](https://t.me/+5t6_LRJfbHswYjA6)
- **Основной канал:** [@thinkred_marx](https://t.me/thinkred_marx)
- **Создатель:** [thethinkred-ai](https://github.com/thethinkred-ai)

---

*MIT License — делайте с этим кодом что хотите, но указывайте оригинал.*
