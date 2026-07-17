import { EventChoice, EventConsequence, GameEvent } from '../../../shared/types';

export function getEventChoices(eventType: string): EventChoice[] {
  if (eventType === 'economic_crisis') {
    return [
      {
        id: 'cut_production',
        text: 'Сократить производство',
        description: 'Уменьшить объемы производства для стабилизации',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -5, unemploymentChange: 3, profitRateChange: 2, concentrationChange: 0, crisisRiskChange: -10 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -5, socialStability: -3, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 2, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'maintain',
        text: 'Сохранить текущий уровень',
        description: 'Продолжать работать в прежнем режиме',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: -3, concentrationChange: 0, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: 0, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'diversify',
        text: 'Диверсифицировать производство',
        description: 'Расширить ассортимент продукции',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 3, unemploymentChange: -1, profitRateChange: 1, concentrationChange: -2, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 2, socialStability: 1, educationLevel: 1 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: -1, reformMovement: 0, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'labor_conflict') {
    return [
      {
        id: 'raise_wages',
        text: 'Повысить зарплату',
        description: 'Удовлетворить требования рабочих',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: -1, profitRateChange: -5, concentrationChange: 0, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 10, socialStability: 5, educationLevel: 0 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -3, reformMovement: 2, repressionLevel: 0 },
      },
      {
        id: 'ignore',
        text: 'Игнорировать требования',
        description: 'Не менять условий труда',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 0, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -10, socialStability: -5, educationLevel: 0 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: 5, reformMovement: -1, repressionLevel: 2 },
      },
    ];
  }

  if (eventType === 'technological_breakthrough') {
    return [
      {
        id: 'adopt_technology',
        text: 'Принять новую технологию',
        description: 'Внедрить инновацию на всех предприятиях',
        requiredKnowledge: ['lesson_3'],
        economicImpact: { gdpChange: 8, unemploymentChange: -2, profitRateChange: 5, concentrationChange: 2, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 3, socialStability: 2, educationLevel: 3 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: 0, reformMovement: 1, repressionLevel: 0 },
      },
      {
        id: 'ignore_tech',
        text: 'Проигнорировать',
        description: 'Технологии слишком дороги, сохранить статус-кво',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 0, profitRateChange: -1, concentrationChange: -1, crisisRiskChange: 3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: 0, educationLevel: -1 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 0, reformMovement: -1, repressionLevel: 0 },
      },
      {
        id: 'sell_patent',
        text: 'Продать патент',
        description: 'Продать права на технологию конкурентам',
        requiredKnowledge: ['lesson_5'],
        economicImpact: { gdpChange: 2, unemploymentChange: 1, profitRateChange: 3, concentrationChange: -3, crisisRiskChange: 0 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -1, socialStability: 0, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'market_change') {
    return [
      {
        id: 'expand_market',
        text: 'Расширить присутствие на рынке',
        description: 'Увеличить долю рынка через маркетинг и дистрибуцию',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 3, unemploymentChange: -1, profitRateChange: 2, concentrationChange: 3, crisisRiskChange: -2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 0, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'cut_prices',
        text: 'Снизить цены',
        description: 'Конкурировать через низкие цены',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: 0, profitRateChange: -3, concentrationChange: 1, crisisRiskChange: 2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: 1, educationLevel: 0 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'diversify_products',
        text: 'Диверсифицировать продукцию',
        description: 'Выпустить новые товары для разных сегментов',
        requiredKnowledge: ['lesson_2'],
        economicImpact: { gdpChange: 4, unemploymentChange: 1, profitRateChange: 1, concentrationChange: -1, crisisRiskChange: -4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 2, socialStability: 1, educationLevel: 1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'peasant_revolt') {
    return [
      {
        id: 'suppress',
        text: 'Подавить силой',
        description: 'Вызвать войска для подавления восстания',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -3, unemploymentChange: 0, profitRateChange: -1, concentrationChange: 2, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -8, socialStability: -3, educationLevel: -1 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: 3, reformMovement: -2, repressionLevel: 5 },
      },
      {
        id: 'negotiate',
        text: 'Вести переговоры',
        description: 'Обсудить требования крестьян и найти компромисс',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 0, profitRateChange: -2, concentrationChange: -1, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 3, socialStability: 4, educationLevel: 1 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: -2, reformMovement: 3, repressionLevel: -1 },
      },
      {
        id: 'concessions',
        text: 'Пойти на уступки',
        description: 'Снизить налоги и улучшить условия для крестьян',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 0, profitRateChange: -4, concentrationChange: -2, crisisRiskChange: -8 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 6, socialStability: 6, educationLevel: 2 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: -4, reformMovement: 4, repressionLevel: -2 },
      },
    ];
  }

  if (eventType === 'land_enclosure') {
    return [
      {
        id: 'participate',
        text: 'Участвовать в огораживании',
        description: 'Присоединиться к захвату общинных земель',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 4, unemploymentChange: 5, profitRateChange: 3, concentrationChange: 3, crisisRiskChange: 2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -3, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: 2, reformMovement: -1, repressionLevel: 1 },
      },
      {
        id: 'oppose',
        text: 'Выступить против',
        description: 'Защитить права крестьян на общинную землю',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: -2, profitRateChange: -1, concentrationChange: -2, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 4, socialStability: 3, educationLevel: 1 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: -1, reformMovement: 3, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'crop_failure') {
    return [
      {
        id: 'import_grain',
        text: 'Импортировать зерно',
        description: 'Закупить продовольствие из других регионов',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 0, profitRateChange: -2, concentrationChange: 1, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 2, socialStability: 3, educationLevel: 0 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: -1, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'ration',
        text: 'Ввести нормирование',
        description: 'Распределять продукты по карточкам',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 0, profitRateChange: -1, concentrationChange: 2, crisisRiskChange: -2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -1, socialStability: 1, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: -1, repressionLevel: 2 },
      },
      {
        id: 'speculate',
        text: 'Спекулировать на дефиците',
        description: 'Скупить зерно и продавать по завышенным ценам',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: 0, profitRateChange: 5, concentrationChange: 3, crisisRiskChange: 8 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -5, socialStability: -5, educationLevel: 0 },
        politicalImpact: { governmentSupport: -3, revolutionaryPotential: 4, reformMovement: -1, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'factory_conditions') {
    return [
      {
        id: 'improve',
        text: 'Улучшить условия',
        description: 'Сократить рабочий день и улучшить условия труда',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: -1, profitRateChange: -6, concentrationChange: 0, crisisRiskChange: -4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 8, socialStability: 4, educationLevel: 2 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -2, reformMovement: 3, repressionLevel: -1 },
      },
      {
        id: 'suppress_workers',
        text: 'Подавить недовольство',
        description: 'Усилить надзор и наказания, запретить собрания',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 1, concentrationChange: 1, crisisRiskChange: 6 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -8, socialStability: -4, educationLevel: -1 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 4, reformMovement: -2, repressionLevel: 5 },
      },
    ];
  }

  if (eventType === 'luddite_rebellion') {
    return [
      {
        id: 'protect_machines',
        text: 'Защищать оборудование',
        description: 'Нанять охрану для защиты машин',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 0, profitRateChange: -2, concentrationChange: 1, crisisRiskChange: 2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -3, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: 2, reformMovement: 0, repressionLevel: 4 },
      },
      {
        id: 'slow_automation',
        text: 'Замедлить автоматизацию',
        description: 'Временно отказаться от внедрения новых машин',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: -1, profitRateChange: -3, concentrationChange: -1, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 5, socialStability: 4, educationLevel: 1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: -2, reformMovement: 1, repressionLevel: 0 },
      },
      {
        id: 'retrain',
        text: 'Программа переобучения',
        description: 'Обучить рабочих новым профессиям',
        requiredKnowledge: ['lesson_3'],
        economicImpact: { gdpChange: 1, unemploymentChange: -3, profitRateChange: -1, concentrationChange: 0, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 4, socialStability: 5, educationLevel: 4 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -2, reformMovement: 2, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'urbanization') {
    return [
      {
        id: 'build_housing',
        text: 'Строить жильё',
        description: 'Инвестировать в строительство жилья для рабочих',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 2, unemploymentChange: -2, profitRateChange: -1, concentrationChange: 0, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 5, socialStability: 4, educationLevel: 1 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -2, reformMovement: 1, repressionLevel: 0 },
      },
      {
        id: 'exploit_labor',
        text: 'Использовать дешёвую рабочую силу',
        description: 'Нанимать мигрантов на низкие зарплаты',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 3, unemploymentChange: 2, profitRateChange: 4, concentrationChange: 2, crisisRiskChange: 4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -4, socialStability: -3, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 3, reformMovement: -1, repressionLevel: 1 },
      },
    ];
  }

  if (eventType === 'trust_busting') {
    return [
      {
        id: 'comply',
        text: 'Подчиниться требованиям',
        description: 'Разделить предприятия для соблюдения закона',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 0, profitRateChange: -3, concentrationChange: -5, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 2, educationLevel: 0 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -1, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'lobby',
        text: 'Лоббировать отмену',
        description: 'Использовать связи для отмены антимонопольного решения',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 1, concentrationChange: 2, crisisRiskChange: 4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: -3, revolutionaryPotential: 1, reformMovement: -2, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'stock_crash') {
    return [
      {
        id: 'sell_assets',
        text: 'Распродать активы',
        description: 'Срочно продать ценные бумаги и часть имущества',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -3, unemploymentChange: 2, profitRateChange: -4, concentrationChange: -1, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -3, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 2, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'hold',
        text: 'Держать активы',
        description: 'Переждать кризис, сохраняя текущие активы',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 0, profitRateChange: -2, concentrationChange: 1, crisisRiskChange: 2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: -1, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'buy_dip',
        text: 'Купить на падении',
        description: 'Скупать обесценившиеся активы по низким ценам',
        requiredKnowledge: ['lesson_5'],
        economicImpact: { gdpChange: 1, unemploymentChange: 1, profitRateChange: 3, concentrationChange: 4, crisisRiskChange: 1 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -1, educationLevel: 0 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 1, reformMovement: 0, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'trade_wars') {
    return [
      {
        id: 'domestic_focus',
        text: 'Ориентироваться на внутренний рынок',
        description: 'Переключиться на внутреннее потребление',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: -1, profitRateChange: -2, concentrationChange: 0, crisisRiskChange: -2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 2, educationLevel: 0 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'smuggle',
        text: 'Контрабанда',
        description: 'Продолжить торговлю через посредников и серые схемы',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: 0, profitRateChange: 3, concentrationChange: 2, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: 1, reformMovement: 0, repressionLevel: 3 },
      },
      {
        id: 'diplomacy',
        text: 'Дипломатические переговоры',
        description: 'Лоббировать отмену торговых барьеров через дипломатию',
        requiredKnowledge: ['lesson_6'],
        economicImpact: { gdpChange: 2, unemploymentChange: -1, profitRateChange: 1, concentrationChange: 0, crisisRiskChange: -4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 2, educationLevel: 1 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -1, reformMovement: 1, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'automation_shock') {
    return [
      {
        id: 'full_automate',
        text: 'Полностью автоматизировать',
        description: 'Заменить всех рабочих автоматикой',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 5, unemploymentChange: 10, profitRateChange: 8, concentrationChange: 3, crisisRiskChange: 6 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -10, socialStability: -6, educationLevel: 2 },
        politicalImpact: { governmentSupport: -3, revolutionaryPotential: 5, reformMovement: -1, repressionLevel: 0 },
      },
      {
        id: 'partial',
        text: 'Частичная автоматизация',
        description: 'Автоматизировать только рутинные операции',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 2, unemploymentChange: 3, profitRateChange: 3, concentrationChange: 1, crisisRiskChange: 1 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -1, educationLevel: 1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 1, reformMovement: 1, repressionLevel: 0 },
      },
      {
        id: 'job_guarantee',
        text: 'Гарантия занятости',
        description: 'Сохранить рабочие места, переобучить сотрудников',
        requiredKnowledge: ['lesson_3'],
        economicImpact: { gdpChange: 1, unemploymentChange: -2, profitRateChange: -2, concentrationChange: -1, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 6, socialStability: 5, educationLevel: 4 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -2, reformMovement: 3, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'green_movement') {
    return [
      {
        id: 'ecofriendly',
        text: 'Перейти на зелёные технологии',
        description: 'Инвестировать в экологичное производство',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 1, profitRateChange: -3, concentrationChange: 0, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 3, socialStability: 4, educationLevel: 2 },
        politicalImpact: { governmentSupport: 3, revolutionaryPotential: -2, reformMovement: 4, repressionLevel: 0 },
      },
      {
        id: 'ignore_env',
        text: 'Проигнорировать требования',
        description: 'Продолжить производство без изменений',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: 0, profitRateChange: 2, concentrationChange: 1, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -3, educationLevel: 0 },
        politicalImpact: { governmentSupport: -3, revolutionaryPotential: 2, reformMovement: -2, repressionLevel: 0 },
      },
      {
        id: 'greenwashing',
        text: 'Имитировать заботу',
        description: 'Создать видимость экологической ответственности без реальных изменений',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 1, crisisRiskChange: 2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 1, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 1, reformMovement: -1, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'financial_crisis') {
    return [
      {
        id: 'austerity',
        text: 'Режим строгой экономии',
        description: 'Сократить все расходы, заморозить найм',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -4, unemploymentChange: 3, profitRateChange: -5, concentrationChange: 1, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -4, socialStability: -3, educationLevel: 0 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: 2, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'bailout',
        text: 'Просить господдержку',
        description: 'Обратиться за государственной помощью',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 2, crisisRiskChange: -6 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 1, educationLevel: 0 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 1, reformMovement: 0, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'nationalization') {
    return [
      {
        id: 'resist',
        text: 'Сопротивляться национализации',
        description: 'Перевести активы в офшоры и обжаловать решение',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -3, unemploymentChange: 1, profitRateChange: -2, concentrationChange: -1, crisisRiskChange: 4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -3, educationLevel: 0 },
        politicalImpact: { governmentSupport: -4, revolutionaryPotential: 2, reformMovement: -2, repressionLevel: 4 },
      },
      {
        id: 'cooperate',
        text: 'Сотрудничать с государством',
        description: 'Передать управление, сохранив долю в предприятии',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: -1, profitRateChange: -3, concentrationChange: -3, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 2, socialStability: 3, educationLevel: 0 },
        politicalImpact: { governmentSupport: 3, revolutionaryPotential: -1, reformMovement: 2, repressionLevel: -1 },
      },
      {
        id: 'convert',
        text: 'Преобразовать в кооператив',
        description: 'Добровольно передать предприятие рабочим',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -1, unemploymentChange: -1, profitRateChange: -1, concentrationChange: -4, crisisRiskChange: -5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 6, socialStability: 5, educationLevel: 3 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: -3, reformMovement: 4, repressionLevel: -2 },
      },
    ];
  }

  if (eventType === 'worker_cooperative') {
    return [
      {
        id: 'approve',
        text: 'Поддержать кооператив',
        description: 'Передать управление коллективу рабочих',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: -2, profitRateChange: -1, concentrationChange: -3, crisisRiskChange: -4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 8, socialStability: 5, educationLevel: 3 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: -2, reformMovement: 4, repressionLevel: -1 },
      },
      {
        id: 'reject',
        text: 'Отказать',
        description: 'Сохранить традиционную иерархию управления',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 1, concentrationChange: 1, crisisRiskChange: 3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -4, socialStability: -2, educationLevel: 0 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 2, reformMovement: -1, repressionLevel: 0 },
      },
      {
        id: 'profit_sharing',
        text: 'Доля от прибыли',
        description: 'Ввести систему участия рабочих в прибыли предприятия',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: 0, profitRateChange: -2, concentrationChange: -1, crisisRiskChange: -2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 5, socialStability: 3, educationLevel: 1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: -1, reformMovement: 2, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'political_change') {
    return [
      {
        id: 'support_reforms',
        text: 'Поддержать реформы',
        description: 'Адаптироваться к новым политическим реалиям и поддержать прогрессивные изменения',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 2, unemploymentChange: -1, profitRateChange: -2, concentrationChange: -2, crisisRiskChange: -4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 4, socialStability: 3, educationLevel: 2 },
        politicalImpact: { governmentSupport: 3, revolutionaryPotential: -2, reformMovement: 4, repressionLevel: -1 },
      },
      {
        id: 'resist_change',
        text: 'Сопротивляться изменениям',
        description: 'Использовать влияние для сохранения старого порядка',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 1, profitRateChange: 1, concentrationChange: 3, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -3, socialStability: -3, educationLevel: -1 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: 3, reformMovement: -2, repressionLevel: 4 },
      },
    ];
  }

  if (eventType === 'war') {
    return [
      {
        id: 'war_production',
        text: 'Перейти на военное производство',
        description: 'Переоборудовать предприятия для выпуска военной продукции',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 5, unemploymentChange: -3, profitRateChange: 4, concentrationChange: 3, crisisRiskChange: 3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -2, socialStability: -1, educationLevel: 0 },
        politicalImpact: { governmentSupport: 2, revolutionaryPotential: 1, reformMovement: -2, repressionLevel: 3 },
      },
      {
        id: 'stay_neutral',
        text: 'Сохранить нейтралитет',
        description: 'Продолжить гражданское производство, несмотря на войну',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -3, unemploymentChange: 2, profitRateChange: -2, concentrationChange: 0, crisisRiskChange: 4 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 1, socialStability: 0, educationLevel: 0 },
        politicalImpact: { governmentSupport: -2, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 },
      },
      {
        id: 'profiteer',
        text: 'Нажиться на войне',
        description: 'Использовать военный дефицит для спекуляции и сверхприбыли',
        requiredKnowledge: ['lesson_5'],
        economicImpact: { gdpChange: 2, unemploymentChange: 1, profitRateChange: 8, concentrationChange: 4, crisisRiskChange: 8 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -5, socialStability: -4, educationLevel: 0 },
        politicalImpact: { governmentSupport: -1, revolutionaryPotential: 4, reformMovement: -1, repressionLevel: 0 },
      },
    ];
  }

  if (eventType === 'social_movement') {
    return [
      {
        id: 'support_movement',
        text: 'Поддержать движение',
        description: 'Встать на сторону общественного движения и поддержать его требования',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 1, unemploymentChange: -1, profitRateChange: -3, concentrationChange: -2, crisisRiskChange: -3 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 6, socialStability: 4, educationLevel: 3 },
        politicalImpact: { governmentSupport: 1, revolutionaryPotential: -1, reformMovement: 5, repressionLevel: -2 },
      },
      {
        id: 'suppress_movement',
        text: 'Подавить движение',
        description: 'Использовать власть и ресурсы для подавления общественного недовольства',
        requiredKnowledge: [],
        economicImpact: { gdpChange: -2, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 2, crisisRiskChange: 5 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: -5, socialStability: -4, educationLevel: -1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: 3, reformMovement: -3, repressionLevel: 5 },
      },
      {
        id: 'concessions',
        text: 'Частичные уступки',
        description: 'Пойти на компромисс, выполнив часть требований движения',
        requiredKnowledge: [],
        economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: -1, concentrationChange: -1, crisisRiskChange: -2 },
        socialImpact: { classConsciousness: {}, workerSatisfaction: 3, socialStability: 3, educationLevel: 1 },
        politicalImpact: { governmentSupport: 0, revolutionaryPotential: -1, reformMovement: 2, repressionLevel: 0 },
      },
    ];
  }

  return [];
}

function buildConsequences(choices: EventChoice[]): EventConsequence[] {
  return choices.map((choice) => ({
    choiceId: choice.id,
    immediate: [
      { type: 'economic' as const, target: 'gdp', value: choice.economicImpact.gdpChange, duration: 1 },
      { type: 'economic' as const, target: 'unemployment', value: choice.economicImpact.unemploymentChange, duration: 1 },
      { type: 'economic' as const, target: 'profitRate', value: choice.economicImpact.profitRateChange, duration: 1 },
      { type: 'social' as const, target: 'workerSatisfaction', value: choice.socialImpact.workerSatisfaction, duration: 1 },
      { type: 'social' as const, target: 'socialStability', value: choice.socialImpact.socialStability, duration: 1 },
      { type: 'political' as const, target: 'governmentSupport', value: choice.politicalImpact.governmentSupport, duration: 1 },
      { type: 'political' as const, target: 'revolutionaryPotential', value: choice.politicalImpact.revolutionaryPotential, duration: 1 },
    ].filter((e) => e.value !== 0),
    longTerm: [
      { type: 'economic' as const, target: 'crisisRisk', value: choice.economicImpact.crisisRiskChange, duration: 3 },
      { type: 'economic' as const, target: 'concentration', value: choice.economicImpact.concentrationChange, duration: 3 },
      { type: 'social' as const, target: 'educationLevel', value: choice.socialImpact.educationLevel, duration: 5 },
      { type: 'political' as const, target: 'reformMovement', value: choice.politicalImpact.reformMovement, duration: 3 },
      { type: 'political' as const, target: 'repressionLevel', value: choice.politicalImpact.repressionLevel, duration: 3 },
    ].filter((e) => e.value !== 0),
    probability: 1,
  }));
}

export function buildGameEventFromRow(row: {
  id: string;
  event_type: string;
  title: string;
  description: string;
  period: string;
  year: number;
  choices_json?: string | null;
}): Pick<GameEvent, 'id' | 'title' | 'description' | 'type' | 'period' | 'year' | 'choices' | 'consequences' | 'prerequisites' | 'weight'> {
  let choices: EventChoice[] = [];
  if (row.choices_json) {
    try {
      choices = JSON.parse(row.choices_json);
    } catch {
      choices = getEventChoices(row.event_type);
    }
  } else {
    choices = getEventChoices(row.event_type);
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.event_type as GameEvent['type'],
    period: row.period as GameEvent['period'],
    year: row.year,
    choices,
    consequences: buildConsequences(choices),
    prerequisites: [],
    weight: 1,
  };
}
