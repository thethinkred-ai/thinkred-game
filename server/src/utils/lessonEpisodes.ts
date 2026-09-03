/**
 * lessonEpisodes.ts — игровые эпизоды, привязанные к урокам «Капитала».
 * Сценарии и карта 34→28: docs/episodes-by-lesson.md
 *
 * Схема соответствует shared/types/events.ts (EventChoice/...Impact).
 * При прохождении урока lesson_XX движок создаёт событие-эпизод с этими
 * вариантами (см. EventSystem.spawnLessonEpisodes). requiredKnowledge —
 * канонические ключи lesson_XX (две цифры).
 * Числа — стартовый баланс для тюнинга (масштаб как в eventTemplates.ts).
 */
import {
  EventChoice,
  EventEconomicImpact,
  SocialImpact,
  PoliticalImpact,
  HistoricalPeriod,
} from '../../../shared/types';

const econ = (o: Partial<EventEconomicImpact> = {}): EventEconomicImpact => ({
  gdpChange: 0, unemploymentChange: 0, profitRateChange: 0,
  concentrationChange: 0, crisisRiskChange: 0, ...o,
});
const soc = (o: Partial<SocialImpact> = {}): SocialImpact => ({
  classConsciousness: {}, workerSatisfaction: 0, socialStability: 0, educationLevel: 0, ...o,
});
const pol = (o: Partial<PoliticalImpact> = {}): PoliticalImpact => ({
  governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0, ...o,
});

export interface LessonEpisode {
  key: string;
  title: string;
  lessonFiles: string[];
  period: HistoricalPeriod;
  description: string;
  choices: EventChoice[];
}

const choice = (
  id: string, text: string, description: string, requiredKnowledge: string[],
  e: Partial<EventEconomicImpact>, s: Partial<SocialImpact>, p: Partial<PoliticalImpact>,
): EventChoice => ({
  id, text, description, requiredKnowledge,
  economicImpact: econ(e), socialImpact: soc(s), politicalImpact: pol(p),
});

export const LESSON_EPISODES: LessonEpisode[] = [
  {
    key: 'lesson_01', title: 'Отчуждение: кому принадлежит плод труда',
    lessonFiles: ['00a', '00b', '00c'], period: 'feudalism',
    description: 'Крестьянин производит продукт, но не узнаёт себя в нём — часть уходит сеньору и «рынку».',
    choices: [
      choice('accept', 'Принять отчуждение («так заведено»)', 'Не оспаривать порядок распределения', [],
        { profitRateChange: 1 }, { workerSatisfaction: -6, socialStability: 3 }, {}),
      choice('demand_share', 'Требовать справедливую долю', 'Претендовать на продукт по труду', [],
        { profitRateChange: -2 }, { workerSatisfaction: 3 }, { reformMovement: 2 }),
    ],
  },
  {
    key: 'lesson_02', title: 'Собственность: посредник-деньги и коммунизм',
    lessonFiles: ['00d', '00e', '00f'], period: 'feudalism',
    description: 'Долю можно получить лишь через деньги и частную собственность на средство производства.',
    choices: [
      choice('private', 'Укрепить частную собственность', 'Средства производства — за мной', [],
        { profitRateChange: 2, concentrationChange: 2 }, { socialStability: -2 }, {}),
      choice('commune', 'Обобщить средства (кооператив)', 'Совместная собственность', ['lesson_28'],
        { profitRateChange: -3 }, { workerSatisfaction: 5 }, { revolutionaryPotential: 2 }),
    ],
  },
  {
    key: 'lesson_03', title: 'Товар: две вещи в одной',
    lessonFiles: ['1', '2'], period: 'feudalism',
    description: 'Сукно и греет (потребительная стоимость), и обменивается (меновая). За меновой — абстрактный труд.',
    choices: [
      choice('use_value', 'Производить на пользу', 'Ремесло ради потребности', [],
        { gdpChange: 1, profitRateChange: -1 }, {}, {}),
      choice('exchange_value', 'Производить на обмен', 'Ради меновой стоимости', [],
        { profitRateChange: 2 }, {}, {}),
    ],
  },
  {
    key: 'lesson_04', title: 'Форма стоимости: где взять меру',
    lessonFiles: ['3'], period: 'feudalism',
    description: 'Величина стоимости видна лишь в отношении к другому товару: простая → денежная форма.',
    choices: [
      choice('expanded', 'Менять на всё подряд', 'Развёрнутая форма стоимости', ['lesson_03'],
        { profitRateChange: -2, crisisRiskChange: 2 }, {}, {}),
      choice('universal', 'Выбрать всеобщий эквивалент', 'Деньгоподобный товар', ['lesson_03'],
        { gdpChange: 2 }, {}, {}),
    ],
  },
  {
    key: 'lesson_05', title: 'Фетишизм товара',
    lessonFiles: ['4'], period: 'early_capitalism',
    description: 'Отношения людей выглядят как свойства вещей: «сукно само стоит 20 фунтов хлеба».',
    choices: [
      choice('fetish', 'Видеть цену в самой вещи', 'Фетишистское сознание', ['lesson_04'],
        { crisisRiskChange: 1 }, { educationLevel: -1, classConsciousness: { proletariat: -1 } }, {}),
      choice('critique', 'Увидеть за вещами труд', 'Критика фетишизма', ['lesson_04'],
        {}, { educationLevel: 2, classConsciousness: { proletariat: 2 } }, { governmentSupport: -1 }),
    ],
  },
  {
    key: 'lesson_06', title: 'Процесс обмена: прыжок со скалы',
    lessonFiles: ['5'], period: 'early_capitalism',
    description: 'Товар надо продать. Продажа — рискованный прыжок; неудача бьёт по производителю.',
    choices: [
      choice('sell_peak', 'Продать на пике спроса', 'Реализовать сразу', ['lesson_05'],
        { gdpChange: 1, profitRateChange: 1, crisisRiskChange: -1 }, {}, {}),
      choice('credit', 'Заложить товар под деньги', 'Кредит против склада', ['lesson_05'],
        { profitRateChange: 2, unemploymentChange: 1, crisisRiskChange: 3 }, {}, {}),
    ],
  },
  {
    key: 'lesson_07', title: 'Деньги: мера и обращение',
    lessonFiles: ['6'], period: 'early_capitalism',
    description: 'Деньги мерят стоимости и вращают обращение Т–Д–Т (продать, чтобы купить).',
    choices: [
      choice('hoard', 'Держать кассу', 'Функция меры и сокровища', ['lesson_06'],
        { profitRateChange: -1, crisisRiskChange: -3 }, {}, {}),
      choice('circulate', 'Пустить в обращение', 'Т–Д–Т', ['lesson_06'],
        { gdpChange: 2 }, {}, {}),
    ],
  },
  {
    key: 'lesson_08', title: 'Д–Т–Д′: превращение денег в капитал',
    lessonFiles: ['7'], period: 'early_capitalism',
    description: 'Купить, чтобы продать дороже: Д′ = Д + Δ. Откуда Δ, если обмен эквивалентен?',
    choices: [
      choice('markup', 'Δ из надценки/обмана', 'Купить дёшево, продать дорого', ['lesson_07'],
        { profitRateChange: 2, crisisRiskChange: 2 }, { socialStability: -2 }, {}),
      choice('production', 'Δ искать в производстве', 'Нужен товар, создающий стоимость', ['lesson_07'],
        {}, {}, {}),
    ],
  },
  {
    key: 'lesson_09', title: 'Противоречие всеобщей формулы',
    lessonFiles: ['8'], period: 'early_capitalism',
    description: 'Разрешение противоречия — особый товар рабочая сила: её потребление создаёт стоимость.',
    choices: [
      choice('coercion', 'Нанять кабально', 'Неравноценный обмен силой', ['lesson_08'],
        { profitRateChange: 3 }, { workerSatisfaction: -8 }, { revolutionaryPotential: 4 }),
      choice('fair_hire', 'Купить силу по её стоимости', 'Оплата как стоимость средств существования', ['lesson_08'],
        { profitRateChange: 1 }, {}, {}),
    ],
  },
  {
    key: 'lesson_10', title: 'Рабочая сила как товар',
    lessonFiles: ['9'], period: 'early_capitalism',
    description: 'Продаётся не труд, а способность к труду; разрыв цены силы и продукта — тайна прибыли.',
    choices: [
      choice('subsistence', 'Платить прожиточный минимум', 'Минимум стоимости силы', ['lesson_09'],
        { profitRateChange: 4, gdpChange: -1 }, { workerSatisfaction: -5 }, {}),
      choice('develop', 'Инвестировать в воспроизводство силы', 'Обучение и условия', ['lesson_09'],
        { profitRateChange: -2, gdpChange: 2 }, { educationLevel: 2 }, {}),
    ],
  },
  {
    key: 'lesson_11', title: 'Процесс труда = процесс увеличения стоимости',
    lessonFiles: ['10'], period: 'industrial_revolution',
    description: 'День делится на необходимое (зарплата) и прибавочное (прибыль) время.',
    choices: [
      choice('extend_day', 'Удлинить день (абсолютная ПС)', 'Больше прибавочного времени', ['lesson_10'],
        { profitRateChange: 5 }, { workerSatisfaction: -6 }, { revolutionaryPotential: 3 }),
      choice('intensity', 'Поднять интенсивность', 'Тот же день, плотнее труд', ['lesson_10'],
        { gdpChange: 2 }, { workerSatisfaction: -2 }, {}),
    ],
  },
  {
    key: 'lesson_12', title: 'Постоянное (c) и переменное (v)',
    lessonFiles: ['11'], period: 'industrial_revolution',
    description: 'Машины переносят стоимость, живой труд прибавляет новую. Прибыль — не от станков.',
    choices: [
      choice('mechanize', 'Машинизировать', 'Экономить живой труд, растить c', ['lesson_11'],
        { profitRateChange: 1, concentrationChange: 2, unemploymentChange: 2 }, {}, {}),
      choice('keep_labor', 'Держать живой труд (v)', 'Ставка на переменный капитал', ['lesson_11'],
        { profitRateChange: -1 }, { workerSatisfaction: 2 }, {}),
    ],
  },
  {
    key: 'lesson_13', title: 'Норма прибавочной стоимости m′ = m/v',
    lessonFiles: ['12'], period: 'industrial_revolution',
    description: 'Степень эксплуатации — прибавок к переменному капиталу, а не маржа по обороту.',
    choices: [
      choice('hide', 'Отчёт по рентабельности оборота', 'PR = m/(c+v), скрывает m′', ['lesson_12'],
        { profitRateChange: 2 }, { classConsciousness: { proletariat: -1 } }, { governmentSupport: 1 }),
      choice('reveal', 'Публичная метрика m′', 'Эксплуатация на виду', ['lesson_12'],
        {}, { classConsciousness: { proletariat: 2 } }, { reformMovement: 2 }),
    ],
  },
  {
    key: 'lesson_14', title: 'Рабочий день: чья граница?',
    lessonFiles: ['13'], period: 'industrial_revolution',
    description: 'Абсолютная ПС упирается в предел дня. Право покупателя на день против права рабочего на жизнь.',
    choices: [
      choice('long_day', '16-часовой день', 'Максимум абсолютной ПС', ['lesson_13'],
        { profitRateChange: 6, crisisRiskChange: 4 }, { workerSatisfaction: -10 }, { revolutionaryPotential: 6 }),
      choice('limit_day', 'Закон об ограничении дня', '10 часов', ['lesson_13'],
        { profitRateChange: -3, gdpChange: -1 }, { workerSatisfaction: 6 }, { reformMovement: 4 }),
    ],
  },
  {
    key: 'lesson_15', title: 'Норма и масса: M = m′ · V',
    lessonFiles: ['14'], period: 'industrial_revolution',
    description: 'Массу ПС задают степень (m′) и число оплаченных рабочих (V).',
    choices: [
      choice('boost_rate', 'Поднять m′, сократив занятых', 'Рост нормы против объёма', ['lesson_14'],
        { profitRateChange: 3, gdpChange: -1, unemploymentChange: 4 }, {}, {}),
      choice('expand_V', 'Расширить V', 'Больше рабочих при прежней норме', ['lesson_14'],
        { gdpChange: 2, profitRateChange: -1 }, {}, {}),
    ],
  },
  {
    key: 'lesson_16', title: 'Относительная ПС: сжать необходимое время',
    lessonFiles: ['15'], period: 'industrial_revolution',
    description: 'При неизменном дне m′ растёт только через производительность и удешевление корзины.',
    choices: [
      choice('first_adopter', 'Внедрить станок первым', 'Временная сверхприбыль', ['lesson_15'],
        { profitRateChange: 4, concentrationChange: 2 }, {}, {}),
      choice('standard', 'Отраслевой стандарт методики', 'Всеобщее внедрение', ['lesson_15'],
        { gdpChange: 2 }, {}, { reformMovement: 2 }),
    ],
  },
  {
    key: 'lesson_17', title: 'Кооперация: много рук, одна воля',
    lessonFiles: ['16'], period: 'industrial_revolution',
    description: 'Совместный труд под одним началом даёт прирост «даром» — но присваивается капиталу.',
    choices: [
      choice('managed_coop', 'Кооперация под надзором', 'Капиталистическое единство воли', ['lesson_16'],
        { gdpChange: 3 }, { workerSatisfaction: -2, socialStability: 1 }, {}),
      choice('self_managed', 'Самоуправляемая кооперация', 'Ассоциация производителей', ['lesson_16', 'lesson_28'],
        { profitRateChange: -3 }, { workerSatisfaction: 6 }, { revolutionaryPotential: 3 }),
    ],
  },
  {
    key: 'lesson_18', title: 'Разделение труда и мануфактура',
    lessonFiles: ['17'], period: 'industrial_revolution',
    description: 'Частичные операции ускоряют труд, но калечат рабочего и отделяют умственный продукт от него.',
    choices: [
      choice('detail_division', 'Специализация операций', 'Классическая мануфактура', ['lesson_17'],
        { gdpChange: 3, concentrationChange: 2 }, { workerSatisfaction: -3, classConsciousness: { proletariat: 1 } }, {}),
      choice('rotation', 'Ротация и квалификация', 'Развитие всестороннего работника', ['lesson_17'],
        { gdpChange: 1, profitRateChange: -2 }, { educationLevel: 2 }, {}),
    ],
  },
  {
    key: 'lesson_19', title: 'Машины и крупная промышленность',
    lessonFiles: ['18'], period: 'monopoly_capitalism',
    description: 'Машина вытесняет живую силу; рабочий становится придатком механизма.',
    choices: [
      choice('full_machines', 'Тотальная механизация', 'Обесценить квалификацию', ['lesson_18'],
        { profitRateChange: 5, unemploymentChange: 6, crisisRiskChange: 4 }, {}, { revolutionaryPotential: 3 }),
      choice('cheaper_goods', 'Машина ради дешёвого товара', 'Относительная ПС в массы', ['lesson_18'],
        { gdpChange: 4, profitRateChange: 1, concentrationChange: 3 }, {}, {}),
    ],
  },
  {
    key: 'lesson_20', title: 'Абсолютная и относительная — одна река',
    lessonFiles: ['19'], period: 'monopoly_capitalism',
    description: 'Удлинение дня и сжатие необходимого времени — две стороны одного роста m′.',
    choices: [
      choice('relative', 'Ставка на относительную ПС', 'Техноразвитие и organic c/v', ['lesson_19'],
        { profitRateChange: 3, concentrationChange: 2 }, {}, {}),
      choice('absolute_gray', 'Абсолютный переработок «серой зоной»', 'Обход ограничения дня', ['lesson_19'],
        { profitRateChange: 2 }, { workerSatisfaction: -5 }, { reformMovement: -3, revolutionaryPotential: 4 }),
    ],
  },
  {
    key: 'lesson_21', title: 'Цена рабочей силы и скачок ПС',
    lessonFiles: ['20'], period: 'monopoly_capitalism',
    description: 'Дешевеет корзина — дешевеет сила — растёт прибавок при том же дне.',
    choices: [
      choice('cheap_basket', 'Давить на стоимость корзины', 'Дешёвое продовольствие/импорт', ['lesson_20'],
        { profitRateChange: 4 }, { workerSatisfaction: -2 }, {}),
      choice('index_wage', 'Индексировать силу к производительности', 'Доля рабочих растёт', ['lesson_20'],
        { profitRateChange: -3 }, { workerSatisfaction: 5 }, { reformMovement: 3, revolutionaryPotential: -2 }),
    ],
  },
  {
    key: 'lesson_22', title: 'Зарплата как превращённая форма',
    lessonFiles: ['21'], period: 'monopoly_capitalism',
    description: 'Зарплата является как «цена труда за день», стирая деление на необходимое/прибавочное время.',
    choices: [
      choice('salary_disguise', 'Оклад «за результат»', 'Скрыть прибавочное время', ['lesson_21'],
        { profitRateChange: 2 }, { workerSatisfaction: 0, socialStability: 2, classConsciousness: { proletariat: -1 } }, {}),
      choice('payroll_open', 'Открытая отчётность по прибавку', 'Показать m рабочим', ['lesson_21'],
        {}, { educationLevel: 2, classConsciousness: { proletariat: 2 } }, { governmentSupport: -1 }),
    ],
  },
  {
    key: 'lesson_23', title: 'Повременная против сдельной',
    lessonFiles: ['22'], period: 'imperialism',
    description: 'Сдельная плата маскирует интенсивность: рабочий сам себя эксплуатирует.',
    choices: [
      choice('piece_wage', 'Перевести на сдельщину', 'Оплата за штуку', ['lesson_22'],
        { gdpChange: 3, profitRateChange: 3, crisisRiskChange: 2 }, { workerSatisfaction: -4 }, {}),
      choice('time_wage', 'Повременная с защитой темпа', 'День, а не штуки', ['lesson_22'],
        { profitRateChange: -2 }, { workerSatisfaction: 4 }, { reformMovement: 2 }),
    ],
  },
  {
    key: 'lesson_24', title: 'Национальные различия зарплаты',
    lessonFiles: ['23'], period: 'imperialism',
    description: 'Свободная торговля уравнивает цены товаров, но углубляет разрыв в цене рабочей силы.',
    choices: [
      choice('offshore', 'Аутсорс в дешёвые регионы', 'Наращивать конкурентность', ['lesson_23'],
        { profitRateChange: 5, concentrationChange: 3, unemploymentChange: 4, crisisRiskChange: 3 }, {}, {}),
      choice('solidarity', 'Международный стандарт оплаты', 'Солидарность рабочих', ['lesson_23'],
        { profitRateChange: -2 }, { workerSatisfaction: 5, classConsciousness: { proletariat: 2 } }, { reformMovement: 4 }),
    ],
  },
  {
    key: 'lesson_25', title: 'Простое воспроизводство',
    lessonFiles: ['24'], period: 'imperialism',
    description: 'Цикл воспроизводит не только товары, но и само капиталистическое отношение.',
    choices: [
      choice('consume_surplus', 'Проедать весь прибавок', 'Роскошь без расширения', ['lesson_24'],
        { profitRateChange: -1, concentrationChange: -1 }, { socialStability: 1 }, {}),
      choice('reinvest', 'Реинвестировать часть', 'Зачаток накопления', ['lesson_24'],
        { concentrationChange: 1 }, {}, {}),
    ],
  },
  {
    key: 'lesson_26', title: 'Накопление: прибавочная стоимость → капитал',
    lessonFiles: ['25'], period: 'imperialism',
    description: 'Часть m капитализируется; законы обмена оборачиваются законами присвоения чужого труда.',
    choices: [
      choice('expand', 'Расширенное накопление', 'Рост organic c/v', ['lesson_25'],
        { gdpChange: 4, concentrationChange: 4, unemploymentChange: 3, crisisRiskChange: 4 }, {}, {}),
      choice('distribute', 'Ограничить накопление распределением', 'Потребление рабочих', ['lesson_25'],
        { profitRateChange: -4 }, { workerSatisfaction: 6 }, { reformMovement: 4, revolutionaryPotential: -2 }),
    ],
  },
  {
    key: 'lesson_27', title: 'Всеобщий закон накопления',
    lessonFiles: ['26'], period: 'modern_capitalism',
    description: 'Рост c/v создаёт промышленную резервную армию; богатство и нищета поляризуются.',
    choices: [
      choice('automation', 'Оптимизация/автоматизация', 'Максимум m′ через резерв', ['lesson_26'],
        { profitRateChange: 5, unemploymentChange: 8, crisisRiskChange: 6 }, {}, { revolutionaryPotential: 6 }),
      choice('absorb_reserve', 'Сократить день / переобучить', 'Впитать резерв', ['lesson_26'],
        { gdpChange: -1, profitRateChange: -3 }, { workerSatisfaction: 6 }, { reformMovement: 5 }),
    ],
  },
  {
    key: 'lesson_28', title: 'Первоначальное накопление + колонизация → синтез',
    lessonFiles: ['27', '28'], period: 'socialism_transition',
    description: '«Идилия» накопления имеет историю насилия и отделения; колонизация воспроизводит отделение.',
    choices: [
      choice('nationalize', 'Национализация / обобщение', 'Путь перехода', ['lesson_27'],
        { profitRateChange: -5, concentrationChange: -6 }, { workerSatisfaction: 8 }, { revolutionaryPotential: -6 }),
      choice('redistribute', 'Перераспределение внутри рынка', 'Реформы', ['lesson_27'],
        { profitRateChange: -2, crisisRiskChange: -3 }, { workerSatisfaction: 4 }, { reformMovement: 6 }),
      choice('entrench', 'Укрепить «естественный порядок»', 'Статус-кво → кризис', ['lesson_27'],
        { crisisRiskChange: 5 }, { classConsciousness: { proletariat: -2 } }, { governmentSupport: 3, revolutionaryPotential: 4 }),
    ],
  },
];

export function getLessonEpisode(key: string): LessonEpisode | undefined {
  return LESSON_EPISODES.find((e) => e.key === key);
}

export function getLessonEpisodeChoices(key: string): EventChoice[] {
  return getLessonEpisode(key)?.choices ?? [];
}
