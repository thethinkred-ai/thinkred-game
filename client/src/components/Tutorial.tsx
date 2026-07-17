import React, { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в ThinkRed!',
    content: 'Это образовательная экономическая стратегия, основанная на марксистской политэкономии. Вы будете управлять предприятиями, принимать решения и проходить через исторические эпохи.',
  },
  {
    id: 'dashboard',
    title: 'Дашборд',
    content: 'На дашборде отображаются ключевые показатели вашей экономической империи: прибыль, рабочие, прибавочная стоимость и активные события.',
  },
  {
    id: 'enterprises',
    title: 'Предприятия',
    content: 'Создавайте и управляйте предприятиями. Каждое предприятие имеет рабочих, зарплату, производство и технологический уровень. Баланс между прибылью и условиями труда — ключ к успеху.',
  },
  {
    id: 'events',
    title: 'События',
    content: 'Исторические события требуют ваших решений. Каждый выбор влияет на экономику, общество и политическую ситуацию. Внимательно изучайте последствия!',
  },
  {
    id: 'periods',
    title: 'Исторические эпохи',
    content: 'Игра проходит через 8 эпох: от феодализма до коммунизма. Для перехода в новую эпоху выполняйте условия: набирайте уровень, создавайте предприятия и накапливайте опыт.',
  },
  {
    id: 'done',
    title: 'Готово!',
    content: 'Теперь вы готовы начать. Исследуйте интерфейс, принимайте решения и стройте свою экономическую империю!',
  },
];

export const Tutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('tutorial_dismissed') === 'true';
  });

  useEffect(() => {
    if (dismissed) {
      onComplete();
    }
  }, [dismissed, onComplete]);

  if (dismissed) return null;

  const step = TUTORIAL_STEPS[currentStep];
  if (!step) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('tutorial_dismissed', 'true');
      setDismissed(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial_dismissed', 'true');
    setDismissed(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card max-w-lg w-full mx-4 border-red-900/40 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center border border-red-500/30">
              <span className="text-white font-black text-lg">TR</span>
            </div>
            <h2 className="card-title text-lg">{step.title}</h2>
          </div>
        </div>

        <div className="px-4 pb-2">
          <p className="text-slate-300 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-red-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={handleSkip} className="btn btn-secondary text-sm px-3 py-1.5">
              Пропустить
            </button>
            <button onClick={handleNext} className="btn btn-primary text-sm px-4 py-1.5">
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Далее' : 'Начать игру!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};