@echo off
chcp 65001 >nul
title ThinkRed Economic Simulator

echo.
echo 🎮 Запуск ThinkRed Economic Simulator...
echo.

REM Проверяем структуру проекта
echo 📁 Проверка структуры проекта...
if not exist "client\package.json" (
    echo ❌ Ошибка: client\package.json не найден
    pause
    exit /b 1
)
if not exist "server\package.json" (
    echo ❌ Ошибка: server\package.json не найден
    pause
    exit /b 1
)
if not exist "server\.env" (
    echo ❌ Ошибка: server\.env не найден
    echo 💡 Скопируйте server\.env.example в server\.env
    pause
    exit /b 1
)
echo ✅ Структура проекта корректна

REM Проверяем зависимости
echo.
echo 📦 Проверка зависимостей...
cd client
if not exist "node_modules" (
    echo 📦 Установка клиентских зависимостей...
    npm install
)
cd ..\server
if not exist "node_modules" (
    echo 📦 Установка серверных зависимостей...
    npm install
)
cd ..
echo ✅ Зависимости готовы

REM Запуск серверов
echo.
echo 🚀 Запуск серверов...
echo.

echo 🔧 Запуск backend сервера (порт 3001)...
start "ThinkRed Server" /min cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Запуск frontend приложения (порт 3000)...
start "ThinkRed Client" /min cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ✅ Оба сервера запущены!
echo.
echo 🌐 Приложение доступно по адресу:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    Health Check: http://localhost:3001/health
echo.
echo 🎮 ThinkRed Economic Simulator готов к работе!
echo.
echo 💡 Для остановки серверов закройте окна серверов
echo.

echo Нажмите любую клавишу для открытия браузера...
pause >nul

start http://localhost:3000

echo.
echo 🎮 ThinkRed Economic Simulator запущен!
echo 🚀 Пойми капитализм. Построй стратегию. Измени взгляд на мир.
echo.
pause
