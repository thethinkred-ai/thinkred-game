import React from 'react';

export const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6">Политика конфиденциальности</h1>
      <p className="mb-4 text-sm text-gray-600">
        ThinkRed Economic Simulator обрабатывает минимум персональных данных, необходимых для игрового процесса и интеграции со Stepik.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Какие данные собираются</h2>
      <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
        <li>Идентификатор Stepik, имя, email (при авторизации через Stepik OAuth)</li>
        <li>Игровой прогресс, предприятия, решения и достижения</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">Как хранятся данные</h2>
      <p className="mb-4 text-sm text-gray-600">
        OAuth-токены Stepik и сессионные JWT хранятся в защищённых HttpOnly-cookie. JWT содержит только идентификатор пользователя, без email или имени.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Срок хранения</h2>
      <p className="mb-4 text-sm text-gray-600">
        Данные хранятся до удаления аккаунта. JWT-сессии действуют 7 дней.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Ваши права</h2>
      <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
        <li>Экспортировать все свои данные через <code>/api/me/export</code></li>
        <li>Удалить аккаунт и все связанные данные через <code>DELETE /api/me</code></li>
      </ul>
      <div className="mt-8 text-center">
        <a href="/login" className="text-red-600 hover:text-red-500 font-medium">Назад ко входу</a>
      </div>
    </div>
  </div>
);
