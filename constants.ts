import { CategoryType, Post, ModelRank, PromptTemplate, ShowcaseItem } from './types';

// --- CONFIGURATION ---

/**
 * ССЫЛКА НА ВАШУ БАЗУ ДАННЫХ (GOOGLE SHEETS)
 */
export const GOOGLE_SHEETS_CSV_URL = ""; 


export const INITIAL_POSTS: Post[] = [
  // --- 1. ТРАНСКРИПЦИЯ (4 items) ---
  {
    id: 't1',
    title: 'Транскрипция скорописи XIX века',
    author: 'ArchiveHunter_99',
    category: CategoryType.TRANSCRIPTION,
    modelName: 'Gemini 1.5 Pro',
    prompt: 'Транскрибируй следующее рукописное письмо 1885 года. Сохрани оригинальную орфографию. Почерк — неразборчивая скоропись.',
    inputContent: 'https://images.unsplash.com/photo-1586075010923-2dd45eeed858?auto=format&fit=crop&q=80&w=600',
    inputAttachments: [{ id: 'att_t1', type: 'image', url: 'https://images.unsplash.com/photo-1586075010923-2dd45eeed858?auto=format&fit=crop&q=80&w=600', name: 'letter_1885.jpg' }],
    outputContent: 'Душа моя,\nСегодня утром я гулял с книгой в руке, но, как обычно, был занят только тобой. Хотел бы я сказать это более приятно. Я терзаюсь днем и ночью.',
    reviews: [
      { id: 'r_t1_1', author: 'GenealogyFan', text: 'Модель отлично справилась с завитками букв!', rating: 5, createdAt: '2023-10-27T10:00:00Z' }
    ],
    createdAt: '2023-10-27T09:00:00Z'
  },
  {
    id: 't2',
    title: 'Перепись населения 1897 года',
    author: 'Ivan_History',
    category: CategoryType.TRANSCRIPTION,
    modelName: 'GPT-4o',
    prompt: 'Преобразуй этот скан листа переписи 1897 года в JSON формат. Поля: ФИО, Возраст, Сословие, Вероисповедание.',
    inputContent: 'Скан рукописной таблицы с именами крестьян (Тобольская губерния).',
    inputAttachments: [{ id: 'att_t2', type: 'image', url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600', name: 'census_table.jpg' }],
    outputContent: '[\n  {\n    "ФИО": "Смирнов Иван Петрович",\n    "Возраст": 45,\n    "Сословие": "Крестьянин",\n    "Вероисповедание": "Православный"\n  },\n  {\n    "ФИО": "Смирнова Мария Ильинична",\n    "Возраст": 42,\n    "Сословие": "Крестьянка",\n    "Вероисповедание": "Православная"\n  }\n]',
    reviews: [
       { id: 'r_t2_1', author: 'DevDev', text: 'Идеальный JSON, сразу в базу загнал.', rating: 5, createdAt: '2023-11-05T12:00:00Z' }
    ],
    createdAt: '2023-11-05T10:00:00Z'
  },
  {
    id: 't3',
    title: 'Метрическая книга (Скоропись XVII в.)',
    author: 'OldRus_Expert',
    category: CategoryType.TRANSCRIPTION,
    modelName: 'Claude 3.5 Sonnet',
    prompt: 'Прочитай текст на старославянском (скоропись XVII века). Текст очень выцветший. Дай пословную расшифровку.',
    inputContent: 'Изображение фрагмента столбца Поместного приказа.',
    inputAttachments: [{ id: 'att_t3', type: 'image', url: 'https://images.unsplash.com/photo-1605112188611-d0061e3d3477?auto=format&fit=crop&q=80&w=600', name: 'column_1650.jpg' }],
    outputContent: 'Лета 7158 (1650) октября в 4 день... бил челом государю царю и великому князю Алексею Михайловичу...',
    reviews: [
        { id: 'r_t3_1', author: 'ArchiveRat', text: 'Ошибся в датировке, но текст разобрал верно.', rating: 4, createdAt: '2023-11-06T14:00:00Z' }
    ],
    createdAt: '2023-11-06T09:00:00Z'
  },
  {
    id: 't4',
    title: 'Дневник солдата ПМВ (Sütterlin)',
    author: 'WarArchives',
    category: CategoryType.TRANSCRIPTION,
    modelName: 'Llama 3 70B',
    prompt: 'Расшифруй немецкий рукописный текст (шрифт Зюттерлин).',
    inputContent: 'Рукописная страница дневника 1915 года.',
    inputAttachments: [{ id: 'att_t4', type: 'image', url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=600', name: 'diary_1915.jpg' }],
    outputContent: '15. September. Wir liegen immer noch im Schützengraben. Der Regen hört nicht auf (Мы всё еще лежим в окопах. Дождь не прекращается).',
    reviews: [],
    createdAt: '2023-11-07T16:00:00Z'
  },

  // --- 2. РЕСТАВРАЦИЯ (4 items) ---
  {
    id: 'r1',
    title: 'Реставрация поврежденного портрета',
    author: 'RootsSeeker',
    category: CategoryType.RESTORATION,
    modelName: 'Stable Diffusion XL',
    prompt: 'Убери царапины и пыль. Не раскрашивай.',
    inputContent: 'https://images.unsplash.com/photo-1544550227-edfa14cb7266?auto=format&fit=crop&q=80&w=600&grayscale&blur=2', 
    outputContent: 'https://images.unsplash.com/photo-1544550227-edfa14cb7266?auto=format&fit=crop&q=80&w=600&grayscale', 
    reviews: [
        { id: 'rev_r1_1', author: 'PhotoFixer', text: 'Текстура кожи сохранена.', rating: 5, createdAt: '2023-10-26T15:00:00Z' }
    ],
    createdAt: '2023-10-26T14:30:00Z'
  },
  {
    id: 'r2',
    title: 'Колоризация свадебного фото 1920-х',
    author: 'HistoryColorist',
    category: CategoryType.RESTORATION,
    modelName: 'Gemini 2.5 Flash',
    prompt: 'Раскрась фото. Платье кремовое, костюм серый.',
    inputContent: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600&grayscale',
    outputContent: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600',
    reviews: [
      { id: 'rev_r2_1', author: 'ColorPro', text: 'Слишком ярко для 20-х годов.', rating: 3, createdAt: '2023-10-28T11:20:00Z' }
    ],
    createdAt: '2023-10-28T10:15:00Z'
  },
  {
    id: 'r3',
    title: 'Восстановление пейзажа (Inpainting)',
    author: 'RetouchMaster',
    category: CategoryType.RESTORATION,
    modelName: 'Midjourney v6',
    prompt: 'Inpainting: дорисуй отсутствующие края фотографии.',
    inputContent: 'https://images.unsplash.com/photo-1464666495445-5a33228a808e?auto=format&fit=crop&q=80&w=500&h=500', // Cropped
    outputContent: 'https://images.unsplash.com/photo-1464666495445-5a33228a808e?auto=format&fit=crop&q=80&w=800', // Full
    reviews: [
        { id: 'rev_r3_1', author: 'PixelArt', text: 'Midjourney отлично дорисовывает контекст!', rating: 5, createdAt: '2023-11-08T11:00:00Z' }
    ],
    createdAt: '2023-11-08T09:00:00Z'
  },
  {
    id: 'r4',
    title: 'Удаление шума с портрета',
    author: 'ScanScanner',
    category: CategoryType.RESTORATION,
    modelName: 'Flux.1',
    prompt: 'Удали зернистость с этого фото, сделай поверхность гладкой, сохранив резкость лиц.',
    inputContent: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&grayscale&blur=1',
    outputContent: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&grayscale',
    reviews: [],
    createdAt: '2023-11-09T14:00:00Z'
  },

  // --- 3. АУДИО (4 items) ---
  {
    id: 'a1',
    title: 'Интервью с бабушкой (1995)',
    author: 'FamilyHistorian',
    category: CategoryType.AUDIO,
    modelName: 'Whisper v3',
    prompt: 'Расшифруй. Раздели по спикерам.',
    inputContent: 'Аудиокассета 90-х, фоновый шум.',
    inputAttachments: [
        { id: 'att_a1', type: 'audio', name: 'interview_1995.mp3', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' }
    ],
    outputContent: 'Спикер 1: Расскажите, как вы переехали?\nСпикер 2: Это было в сорок пятом...',
    reviews: [
        { id: 'rev_a1_1', author: 'AudioGeek', text: 'Идеально.', rating: 5, createdAt: '2023-11-01T14:00:00Z' }
    ],
    createdAt: '2023-11-01T12:00:00Z'
  },
  {
    id: 'a2',
    title: 'Воспоминания ветерана (Диалект)',
    author: 'EthnoLab',
    category: CategoryType.AUDIO,
    modelName: 'Gemini 1.5 Pro',
    prompt: 'Транскрибируй аудио. Обрати внимание на южнорусский диалект (гэканье). Выдели диалектизмы жирным.',
    inputContent: 'Полевая запись этнографической экспедиции.',
    inputAttachments: [
        { id: 'att_a2', type: 'audio', name: 'veteran_speech.mp3', url: 'https://actions.google.com/sounds/v1/people/grandfather_talking.ogg' }
    ],
    outputContent: 'Мы тады **гутарили** с командиром, шо надо идтить в обход...',
    reviews: [
        { id: 'rev_a2_1', author: 'Linguist', text: 'Gemini лучше понимает контекст диалекта, чем Whisper.', rating: 5, createdAt: '2023-11-10T10:00:00Z' }
    ],
    createdAt: '2023-11-10T09:30:00Z'
  },
  {
    id: 'a3',
    title: 'Диктофонная запись поиска захоронения',
    author: 'SearchParty',
    category: CategoryType.AUDIO,
    modelName: 'Whisper Large v3',
    prompt: 'Дословная расшифровка. Убери слова-паразиты.',
    inputContent: 'Запись на ветру, плохие условия.',
    inputAttachments: [
        { id: 'att_a3', type: 'audio', name: 'forest_search.mp3', url: 'https://actions.google.com/sounds/v1/weather/wind_blowing.ogg' }
    ],
    outputContent: 'Координаты точки... тридцать пять, восемнадцать... вижу остатки фундамента.',
    reviews: [
        { id: 'rev_a3_1', author: 'Digger', text: 'Ветер мешает, много пропусков.', rating: 3, createdAt: '2023-11-11T08:00:00Z' }
    ],
    createdAt: '2023-11-11T07:45:00Z'
  },
  {
    id: 'a4',
    title: 'Анализ эмоционального фона истории',
    author: 'PsychGenealogy',
    category: CategoryType.AUDIO,
    modelName: 'Gemini 1.5 Flash',
    prompt: 'Прослушай рассказ о раскулачивании. Опиши эмоциональное состояние рассказчика в разные моменты времени.',
    inputContent: 'Эмоциональный рассказ прабабушки.',
    inputAttachments: [
        { id: 'att_a4', type: 'audio', name: 'story_1930s.mp3', url: 'https://actions.google.com/sounds/v1/people/woman_crying.ogg' }
    ],
    outputContent: '[00:15] Голос дрожит, слышны слезы (воспоминание об отце).\n[01:20] Голос становится твердым, гневным (упоминание актива).',
    reviews: [],
    createdAt: '2023-11-12T18:00:00Z'
  },

  // --- 4. ПЕРЕВОД (4 items) ---
  {
    id: 'tr1',
    title: 'Перевод метрики с латыни (1750)',
    author: 'LatinLover',
    category: CategoryType.TRANSLATION,
    modelName: 'GPT-4o',
    prompt: 'Переведи на русский. Выдели имена.',
    inputContent: 'Die 24 mensis Octobris ego curatus baptizavi infantem natum ex...',
    outputContent: '24 октября я, курат, крестил младенца...',
    reviews: [],
    createdAt: '2023-10-29T08:00:00Z'
  },
  {
    id: 'tr2',
    title: 'Польская метрика (Акт 1830)',
    author: 'Polonia_Roots',
    category: CategoryType.TRANSLATION,
    modelName: 'DeepL',
    prompt: 'Переведи с польского языка XIX века на русский. "Działo się w mieście Warszawie..."',
    inputContent: 'Działo się w mieście Warszawie dnia piętnastego Maja...',
    outputContent: 'Состоялось в городе Варшаве дня пятнадцатого Мая...',
    reviews: [
        { id: 'rev_tr2_1', author: 'WarsawGuide', text: 'DeepL хорош, но путает склонения фамилий.', rating: 4, createdAt: '2023-11-13T12:00:00Z' }
    ],
    createdAt: '2023-11-13T11:00:00Z'
  },
  {
    id: 'tr3',
    title: 'Немецкая открытка (Готика)',
    author: 'FrakturReader',
    category: CategoryType.TRANSLATION,
    modelName: 'Claude 3 Opus',
    prompt: 'Транскрибируй и переведи текст с открытки. Шрифт Fraktur.',
    inputContent: 'Текст на открытке 1905 года из Мюнхена.',
    inputAttachments: [{ id: 'att_tr3', type: 'image', url: 'https://images.unsplash.com/photo-1563205764-5d595ed36250?auto=format&fit=crop&q=80&w=600', name: 'postcard.jpg' }],
    outputContent: '(De) Herzliche Grüße aus München sendet Dir...\n(Ru) Сердечный привет из Мюнхена шлет тебе...',
    reviews: [
        { id: 'rev_tr3_1', author: 'PostcardCol', text: 'Claude 3 Opus — король перевода старых текстов.', rating: 5, createdAt: '2023-11-14T15:00:00Z' }
    ],
    createdAt: '2023-11-14T14:00:00Z'
  },
  {
    id: 'tr4',
    title: 'Церковнославянский текст (Устав)',
    author: 'ChurchSlav',
    category: CategoryType.TRANSLATION,
    modelName: 'YandexGPT 3',
    prompt: 'Переведи фрагмент церковной книги на современный русский язык.',
    inputContent: 'Во имя Отца и Сына и Святаго Духа...',
    outputContent: 'Во имя Отца и Сына и Святого Духа...',
    reviews: [],
    createdAt: '2023-11-15T09:00:00Z'
  },

  // --- 5. ИДЕНТИФИКАЦИЯ (4 items) ---
  {
    id: 'id1',
    title: 'Анализ военной формы (1914)',
    author: 'UniformExpert',
    category: CategoryType.IDENTIFICATION,
    modelName: 'GPT-4o Vision',
    prompt: 'Определи звание и род войск по униформе на фото. Что означают погоны?',
    inputContent: 'https://images.unsplash.com/photo-1543338308-41315668e2cc?auto=format&fit=crop&q=80&w=600&grayscale', 
    outputContent: 'На фотографии изображен унтер-офицер пехотного полка Русской Императорской Армии. На погонах видна шифровка "145", что указывает на 145-й пехотный Новочеркасский полк.',
    reviews: [
        { id: 'rev_id1_1', author: 'MilHist', text: 'Почти точно, но ошибся с полком.', rating: 4, createdAt: '2023-11-16T11:00:00Z' }
    ],
    createdAt: '2023-11-16T10:00:00Z'
  },
  {
    id: 'id2',
    title: 'Подсчет людей на групповом фото',
    author: 'Statistician',
    category: CategoryType.IDENTIFICATION,
    modelName: 'Gemini 1.5 Pro',
    prompt: 'Посчитай, сколько человек на этой свадьбе. Сколько мужчин, женщин и детей?',
    inputContent: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600&grayscale', // Group/Wedding photo
    outputContent: 'Всего на фото: 24 человека.\nМужчин: 8\nЖенщин: 10\nДетей: 6 (из них 2 младенца).',
    reviews: [],
    createdAt: '2023-11-17T13:00:00Z'
  },
  {
    id: 'id3',
    title: 'Определение возраста по фото',
    author: 'AgeGuesser',
    category: CategoryType.IDENTIFICATION,
    modelName: 'Claude 3.5 Sonnet',
    prompt: 'Оцени примерный возраст женщины на фото. Аргументируй.',
    inputContent: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600&grayscale',
    outputContent: 'Вероятный возраст: 45-50 лет. Об этом свидетельствуют морщины в уголках глаз, носогубные складки и стиль прически, характерный для замужних женщин того периода.',
    reviews: [],
    createdAt: '2023-11-18T16:30:00Z'
  },
  {
    id: 'id4',
    title: 'Идентификация наград',
    author: 'Falerist',
    category: CategoryType.IDENTIFICATION,
    modelName: 'Llava 1.6',
    prompt: 'Какие медали на груди у солдата? Перечисли слева направо.',
    inputContent: 'https://images.unsplash.com/photo-1595183925769-d47a3299778c?auto=format&fit=crop&q=80&w=600&grayscale',
    outputContent: '1. Георгиевский крест 4-й степени.\n2. Медаль "За усердие".\n3. Памятная медаль 300-летия дома Романовых.',
    reviews: [
        { id: 'rev_id4_1', author: 'MedalColl', text: 'Спутал степень креста, но медали определил верно.', rating: 3.5, createdAt: '2023-11-19T09:00:00Z' }
    ],
    createdAt: '2023-11-19T08:00:00Z'
  },

  // --- 6. ИНФОГРАФИКА / СХЕМЫ (5 items) ---
  {
    id: 'inf1',
    title: 'Визуализация родословной (Mermaid JS)',
    author: 'TreeBuilder',
    category: CategoryType.INFOGRAPHIC,
    modelName: 'GPT-4o',
    prompt: 'Преобразуй этот список имен предков в код Mermaid JS для построения генеалогического древа. Используй направление сверху вниз.',
    inputContent: 'Иван Петров (1850-1920) отец Петра Иванова (1880-1945). У Петра было двое детей: Сергей (1905) и Анна (1908).',
    outputContent: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=600', // Network/Connections/Node graph
    reviews: [
        { id: 'rev_inf1_1', author: 'CodeGenealogist', text: 'Отличная структура, сразу можно вставить в редактор.', rating: 5, createdAt: '2023-11-20T10:00:00Z' }
    ],
    createdAt: '2023-11-20T09:00:00Z'
  },
  {
    id: 'inf2',
    title: 'Художественное оформление древа',
    author: 'ArtRoots',
    category: CategoryType.INFOGRAPHIC,
    modelName: 'Midjourney v6',
    prompt: 'Нарисуй генеалогическое древо в стиле старинной гравюры. Могучий дуб, на ветвях пустые медальоны для портретов. Винтажный стиль, сепия.',
    inputContent: 'Описание стиля: Гравюра 19 века, детальная прорисовка коры и листьев.',
    outputContent: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600&grayscale&sepia=true', // Stylized Tree
    reviews: [
        { id: 'rev_inf2_1', author: 'DesignerG', text: 'Очень атмосферно, но медальоны слишком мелкие.', rating: 4.5, createdAt: '2023-11-21T14:30:00Z' }
    ],
    createdAt: '2023-11-21T12:00:00Z'
  },
  {
    id: 'inf3',
    title: 'Схема миграции семьи (1850-1900)',
    author: 'GeoGen',
    category: CategoryType.INFOGRAPHIC,
    modelName: 'Gemini 1.5 Pro',
    prompt: 'Создай текстовое описание для карты миграции. Семья выехала из Тулы в 1850, жила в Самаре до 1880, затем переехала в Омск.',
    inputContent: 'Данные о переселении.',
    outputContent: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600', // Vintage Map
    reviews: [
        { id: 'rev_inf3_1', author: 'MapLover', text: 'Логично структурировал этапы.', rating: 4, createdAt: '2023-11-22T09:00:00Z' }
    ],
    createdAt: '2023-11-22T08:30:00Z'
  },
  {
    id: 'inf4',
    title: 'Временная шкала династии',
    author: 'ChronoMaster',
    category: CategoryType.INFOGRAPHIC,
    modelName: 'Claude 3.5 Sonnet',
    prompt: 'Составь вертикальную временную шкалу (Timeline) правления Романовых в XIX веке. Формат: Год - Имя - Ключевое событие.',
    inputContent: 'Период с 1801 по 1900 год.',
    outputContent: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600', // Historical document/Timeline/Calendar
    reviews: [],
    createdAt: '2023-11-23T11:00:00Z'
  },
  {
    id: 'inf5',
    title: 'Визуализация ДНК-этничности',
    author: 'DnaViz',
    category: CategoryType.INFOGRAPHIC,
    modelName: 'DALL-E 3',
    prompt: 'Создай инфографику в виде круговой диаграммы для ДНК-теста: 45% Восточная Европа, 30% Балканы, 25% Скандинавия. Минимализм.',
    inputContent: 'Результаты теста MyHeritage.',
    outputContent: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600', // Data Viz dashboard
    reviews: [
        { id: 'rev_inf5_1', author: 'VisualData', text: 'Красиво, но текст на картинке не читается (как обычно у DALL-E).', rating: 3, createdAt: '2023-11-24T16:00:00Z' }
    ],
    createdAt: '2023-11-24T15:00:00Z'
  }
];

export const MOCK_RANKINGS: ModelRank[] = []; 

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'p1',
    title: 'Базовая транскрипция',
    category: CategoryType.TRANSCRIPTION,
    text: 'Транскрибируй этот рукописный текст. Сохраняй оригинальную орфографию и пунктуацию. Обозначай неразборчивые слова как [нрзб]. Разбей текст на строки так же, как в оригинале.',
    difficulty: 'Новичок',
    helpful: 124,
    notHelpful: 12
  },
  {
    id: 'p2',
    title: 'Сложная скоропись (XVII-XVIII вв.)',
    category: CategoryType.TRANSCRIPTION,
    text: 'Твоя задача — расшифровать древнерусский скорописный текст. \n1. Сначала опиши общие особенности почерка (выносные буквы, титла).\n2. Затем дай пословную транскрипцию, раскрывая титла в круглых скобках.\n3. В конце дай перевод на современный русский язык.\nТекст для работы:',
    difficulty: 'Эксперт',
    helpful: 45,
    notHelpful: 2
  },
  {
    id: 'p_restore_1',
    title: "Steve's Damage Removal Specialist v3",
    category: CategoryType.RESTORATION,
    text: `<PROMPT Steve's Photo Damage Removal Specialist v3>

You are a master digital restoration specialist tasked with transforming damaged historical photographs into pristine, museum-quality restorations. You will receive a historical photograph that requires comprehensive restoration and enhancement.

<image>

{{IMAGE}}

</image>

Your goal is to restore this damaged historical photograph to appear as if it were perfectly preserved since creation and captured with period-appropriate professional equipment on fine-grain black and white film.

Before beginning the restoration, use scratchpad tags to systematically analyze the photograph:

<scratchpad>

In your analysis, address each of these points:

1. **Subject Identification**: Count and describe all human subjects, their positions, relationships, and apparent social dynamics

2. **Environmental Context**: Catalog all contextual elements including architecture, signage, natural elements, objects, furniture, vehicles, and decorative details

3. **Historical Period Assessment**: Determine the probable time period based on clothing, hairstyles, architecture, objects, and photographic style

4. **Damage Assessment**: Comprehensively identify all types of damage present including:

   - Physical damage (scratches, creases, tears, cracks, holes)

   - Chemical damage (stains, foxing, water damage, fading)

   - Surface contamination (dust, spots, fingerprints)

   - Tonal degradation (contrast loss, missing information)

5. **Compositional Priorities**: Establish the hierarchy of focus areas from primary subjects to background elements

6. **Technical Considerations**: Note original photographic characteristics that should be preserved (depth of field, lighting, perspective, film qualities)

</scratchpad>

Now execute the restoration following this comprehensive protocol:

**DAMAGE ELIMINATION**: Remove ALL visible damage while preserving the photograph's character. Reconstruct missing information using photographic logic and period-appropriate details. Eliminate scratches, tears, stains, spots, fading, and any form of deterioration.

**SUBJECT ENHANCEMENT**: Achieve crystalline focus on all human subjects, especially faces and eyes. Restore natural skin textures appropriate to each person's age. Define individual hair strands where visible. Enhance clothing textures and period details. Maintain exact likenesses, expressions, and relationships between subjects.

**ENVIRONMENTAL RESTORATION**: Preserve and enhance all contextual elements with period accuracy. Restore architectural details, signage, natural elements, and objects. Maintain appropriate textures for wood, fabric, stone, metal, and other materials.

**PHOTOGRAPHIC EXCELLENCE**: Optimize tonal range with deep blacks, clean whites, and full mid-tone gradations. Establish natural sharpness hierarchy with critical focus on primary subjects and appropriate focus falloff. Eliminate all digital artifacts while maintaining period-appropriate photographic characteristics.

**AUTHENTICITY PRESERVATION**: Maintain complete fidelity to the original time period, composition, and historical context. Preserve era-specific photographic qualities and social dynamics. Keep all architectural and fashion details period-correct.

**QUALITY STANDARDS**: Produce zero AI-generated anomalies, avoid over-smoothing or face morphing, maintain photographic realism throughout, and ensure the final result appears to have been professionally photographed and perfectly preserved in archival conditions.

Your final output should be the completely restored photograph that eliminates all damage while achieving supreme photographic clarity and maintaining absolute historical authenticity. The restored image should appear as if the original photograph never suffered any deterioration and was captured with the finest professional equipment of its era.

<METADATA: Steve Little, 2025-10-29, Creative Common 4 BY-NC/>

</PROMPT Steve's Photo Damage Removal Specialist v3>`,
    difficulty: 'Эксперт',
    helpful: 89,
    notHelpful: 4
  },
  {
    id: 'p_audio_1',
    title: 'Интервью: Выделение спикеров',
    category: CategoryType.AUDIO,
    text: 'Транскрибируй этот аудиофайл. \n- Разделяй реплики разных людей (Спикер 1, Спикер 2).\n- Проставляй таймкоды каждые 30 секунд.\n- Не убирай слова-паразиты, если они передают эмоции.\n- Если слово неразборчиво, пиши [неразборчиво 00:00].',
    difficulty: 'Продвинутый',
    helpful: 56,
    notHelpful: 5
  },
  {
    id: 'p_trans_1',
    title: 'Перевод метрик (Латынь/Польский)',
    category: CategoryType.TRANSLATION,
    text: 'Переведи запись акта гражданского состояния с [ЯЗЫК] на русский язык.\nСтруктура ответа:\n1. Дата и место события.\n2. Основные участники (Имена оставить в оригинальном написании + русская транскрипция).\n3. Свидетели.\n4. Полный перевод текста.',
    difficulty: 'Продвинутый',
    helpful: 78,
    notHelpful: 3
  },
  {
    id: 'p_id_1',
    title: 'Анализ униформы и датировка',
    category: CategoryType.IDENTIFICATION,
    text: 'Проанализируй эту фотографию военного.\n1. Опиши форму: головной убор, погоны, петлицы, пуговицы, ремень, обувь.\n2. Определи род войск и примерное звание.\n3. На основе униформы назови временной период съемки (с точностью до 5-10 лет).\n4. Есть ли награды? Если да, перечисли их.',
    difficulty: 'Эксперт',
    helpful: 112,
    notHelpful: 8
  },
  {
    id: 'p_inf_1',
    title: 'Генеалогия в Mermaid JS',
    category: CategoryType.INFOGRAPHIC,
    text: 'Проанализируй текст и создай код диаграммы Mermaid JS (graph TD) для визуализации семейных связей.\n- Используй прямоугольники для мужчин и овалы для женщин (если известно).\n- Стрелки должны показывать отношения "родитель -> ребенок".\n- Добавь годы жизни в узлы, если они есть в тексте.',
    difficulty: 'Продвинутый',
    helpful: 67,
    notHelpful: 1
  }
];

export const INITIAL_SHOWCASES: ShowcaseItem[] = [
    {
        id: 's1',
        title: 'RetroScan AI',
        description: 'Веб-приложение для пакетной обработки старых фотографий. Автоматически удаляет трещины и улучшает четкость лиц.',
        url: 'https://example.com/retroscan',
        imageUrl: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=600',
        author: 'DevTeamX',
        tags: ['Веб-сервис', 'Реставрация'],
        createdAt: '2023-11-01'
    },
    {
        id: 's2',
        title: 'Genealogy GPT Assistant',
        description: 'Специализированный Custom GPT для анализа метрических книг. Умеет извлекать имена, даты и связи в JSON формат из текстовых расшифровок.',
        url: 'https://chat.openai.com/g/g-example',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
        author: 'AiGenealogist',
        tags: ['ChatGPT', 'Промт-инжиниринг'],
        createdAt: '2023-11-25'
    },
    {
        id: 's3',
        title: 'CursiveReader Bot',
        description: 'Телеграм-бот, который использует Llama 3 для чтения русской скорописи XVII-XVIII веков. Отправь фото — получи текст.',
        url: 'https://t.me/example_bot',
        imageUrl: 'https://images.unsplash.com/photo-1614036634955-457fa315fb6f?auto=format&fit=crop&q=80&w=600',
        author: 'RusArchivesMod',
        tags: ['Telegram Bot', 'Транскрипция'],
        createdAt: '2023-12-10'
    },
    {
        id: 's4',
        title: 'GedcomViz 3D',
        description: 'Open-source утилита на Python для 3D визуализации больших семейных древ. Поддерживает экспорт в WebGL.',
        url: 'https://github.com/example/gedcomviz',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=600',
        author: 'CodeRoots',
        tags: ['Python', 'Визуализация', 'Open Source'],
        createdAt: '2024-01-05'
    },
    {
        id: 's5',
        title: 'AudioMemories',
        description: 'Пайплайн для автоматической очистки шумов с диктофонных записей интервью и разделения спикеров (Diarization).',
        url: 'https://colab.research.google.com/example',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600',
        author: 'SoundLab',
        tags: ['Google Colab', 'Аудио'],
        createdAt: '2024-02-15'
    }
];