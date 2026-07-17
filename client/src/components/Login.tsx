import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login, devLogin, user } = useAuth();

  if (user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ThinkRed Economic Simulator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Историческая экономическая стратегия для обучения марксистской политэкономии
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-20 h-20 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">TR</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Добро пожаловать в ThinkRed!
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Для доступа к игре необходимо войти через Stepik
                </p>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Управляйте предприятиями</strong> - от мануфактур до современных фабрик
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Принимайте экономические решения</strong> и наблюдайте за последствиями
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Изучайте политэкономию</strong> через практические сценарии
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Проходите через исторические эпохи</strong> от феодализма до коммунизма
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={login}
                  className="w-full btn btn-primary py-3 text-base font-medium"
                >
                  Войти через Stepik
                </button>

                {import.meta.env.DEV && (
                  <>
                    <button
                      onClick={devLogin}
                      className="w-full mt-3 py-3 text-base font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Демо-вход (без Stepik)
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Демо-режим для локального тестирования игры
                    </p>
                  </>
                )}
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Нажимая кнопку входа, вы соглашаетесь с{' '}
                <a href="/privacy" className="underline hover:text-gray-700">политикой конфиденциальности</a>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Нет аккаунта на Stepik?{' '}
              <a 
                href="https://stepik.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-red-600 hover:text-red-500"
              >
                Зарегистрируйтесь
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
