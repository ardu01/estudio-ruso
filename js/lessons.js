(function (root) {
  const consonants = ['м', 'п', 'б', 'д', 'т', 'н', 'л', 'р', 'к', 'г', 'с', 'з'];
  const vowels = [
    { letter: 'а', tr: 'a' },
    { letter: 'о', 'tr': 'o' },
    { letter: 'у', tr: 'u' },
    { letter: 'и', tr: 'i' }
  ];
  const syllables = [];
  vowels.forEach(function (vowel) {
    consonants.forEach(function (consonant) {
      const ru = consonant + vowel.letter;
      syllables.push({
        id: consonant + vowel.letter,
        ru: ru,
        tr: consonant.replace('с', 's').replace('з', 'z') + vowel.tr,
        vowel: vowel.letter
      });
    });
  });
  syllables.forEach(function (item) {
    const map = { м: 'm', п: 'p', б: 'b', д: 'd', т: 't', н: 'n', л: 'l', р: 'r', к: 'k', г: 'g', с: 's', з: 'z' };
    item.tr = (map[item.ru[0]] || item.ru[0]) + item.tr.slice(-1);
  });

  const grammar = [
    {
      id: 'genero',
      title: 'El género',
      level: 'Gramática',
      blurb: 'Masculino, femenino y neutro.',
      paragraphs: [
        'El diccionario da el género. No siempre coincide con el español.',
        'Masculino: suele acabar en consonante (дом, брат). Femenino: en -а o -я (мама, неделя). Neutro: en -о o -е (окно, море).',
        'Hay trampas: папа y дядя son masculinos aunque acaben en -а. кофе no cambia y se trata como masculino.'
      ],
      examples: [
        ['дом', 'DOM', 'casa', 'masculino'],
        ['книга', 'KNI-ga', 'libro', 'femenino'],
        ['окно', 'ak-NO', 'ventana', 'neutro'],
        ['папа', 'PA-pa', 'papá', 'masculino, aunque acabe en -а']
      ],
      questions: [
        { prompt: '¿Qué género tiene «книга»?', options: ['masculino', 'femenino', 'neutro'], answer: 1 },
        { prompt: '¿Qué género tiene «окно»?', options: ['masculino', 'femenino', 'neutro'], answer: 2 },
        { prompt: '¿Qué género tiene «папа»?', options: ['masculino', 'femenino', 'neutro'], answer: 0 },
        { prompt: 'Una palabra en consonante, como «стол», suele ser…', options: ['masculina', 'femenina', 'neutra'], answer: 0 }
      ]
    },
    {
      id: 'plural',
      title: 'El plural',
      level: 'Gramática',
      blurb: 'De una cosa a varias.',
      paragraphs: [
        'El plural regular se forma desde el nominativo singular.',
        'Consonante + ы: стол → столы. Si acaba en к, г, х, ш, щ, ч o ж, se usa и: книга → книги.',
        'о → а: окно → окна. я → и: неделя → недели. Hay muchos irregulares (человек → люди); aquí solo el patrón útil.'
      ],
      examples: [
        ['столы', 'sta-LY', 'stoly', 'mesas'],
        ['книги', 'KNI-gi', 'knigi', 'libros'],
        ['окна', 'OK-na', 'okna', 'ventanas'],
        ['недели', 'ni-DYE-li', 'nedeli', 'semanas']
      ],
      questions: [
        { prompt: 'El plural regular de «стол» es…', options: ['столы', 'стола', 'столи'], answer: 0 },
        { prompt: '«книга» en plural es…', options: ['книгы', 'книги', 'книга'], answer: 1 },
        { prompt: '«окно» en plural es…', options: ['окны', 'окна', 'окни'], answer: 1 },
        { prompt: 'Tras к, г, х, ш, щ, ч, ж el plural usa…', options: ['ы', 'и', 'а'], answer: 1 }
      ]
    },
    {
      id: 'presente',
      title: 'El presente',
      level: 'Gramática',
      blurb: 'Yo, tú, él y los demás.',
      paragraphs: [
        'El infinitivo acaba en -ть. En presente se quita y entran las personas.',
        'читать: я читаю, ты читаешь, он читает, мы читаем, вы читаете, они читают.',
        'жить cambia más: я живу, ты живёшь, они живут. хотеть es irregular: я хочу, ты хочешь, мы хотим, они хотят.'
      ],
      examples: [
        ['я читаю', 'ya chi-TA-yu', 'yo leo'],
        ['ты говоришь', 'ty ga-va-RISH', 'tú hablas'],
        ['мы живём', 'my zhi-VYOM', 'nosotros vivimos'],
        ['они хотят', 'a-NI kha-TYAT', 'ellos quieren']
      ],
      questions: [
        { prompt: '«Yo leo» es…', options: ['я читаю', 'я читаешь', 'я читает'], answer: 0 },
        { prompt: '«Tú hablas» es…', options: ['ты говорю', 'ты говоришь', 'ты говорят'], answer: 1 },
        { prompt: '«Ellos quieren» es…', options: ['они хочу', 'они хотим', 'они хотят'], answer: 2 },
        { prompt: '«Nosotros vivimos» es…', options: ['мы живёшь', 'мы живём', 'мы живут'], answer: 1 }
      ]
    },
    {
      id: 'casos',
      title: 'Nominativo y acusativo',
      level: 'Gramática',
      blurb: 'Quién hace la acción y a quién le pasa.',
      paragraphs: [
        'El nominativo es la forma del diccionario. Es el sujeto: Мама читает.',
        'El acusativo es el objeto directo. Si la cosa es inanimada y masculina o neutra, no cambia: Я читаю журнал.',
        'El femenino en -а pasa a -у, y -я a -ю: Я вижу маму. Я люблю музыку. El masculino animado (veo a mi hermano) cambia más; eso puede esperar.'
      ],
      examples: [
        ['Мама читает', 'MA-ma chi-TA-yet', 'Mamá lee', 'мама en nominativo'],
        ['Я читаю журнал', 'ya chi-TA-yu zhur-NAL', 'Leo una revista', 'objeto inanimado, igual que el diccionario'],
        ['Я вижу маму', 'ya VI-zhu MA-mu', 'Veo a mamá', 'мама → маму'],
        ['Я люблю музыку', 'ya lyub-LYU MU-zy-ku', 'Me gusta la música', 'музыка → музыку']
      ],
      questions: [
        { prompt: 'Completa: Я вижу ___ (мама).', options: ['мама', 'маму', 'мамы'], answer: 1 },
        { prompt: 'Completa: Я читаю ___ (книга).', options: ['книга', 'книгу', 'книги'], answer: 1 },
        { prompt: '«Мама читает» usa мама en…', options: ['nominativo', 'acusativo', 'plural'], answer: 0 },
        { prompt: 'Un objeto masculino inanimado, como журнал, en acusativo…', options: ['cambia a -у', 'no cambia', 'pasa a plural'], answer: 1 }
      ]
    },
    {
      id: 'posesion',
      title: 'La posesión',
      level: 'Gramática',
      blurb: 'Mi, tu, y «tengo».',
      paragraphs: [
        'мой, моя, моё y мои concuerdan con la cosa, no con la persona.',
        'мой брат, моя сестра, моё окно, мои книги. Con ты: твой, твоя, твоё, твои.',
        '«Tengo» casi nunca es un verbo. Se dice у меня есть: У меня есть брат. La pregunta es У тебя есть…?'
      ],
      examples: [
        ['мой брат', 'moy BRAT', 'mi hermano'],
        ['моя сестра', 'ma-YA sis-TRA', 'mi hermana'],
        ['моё окно', 'ma-YO ak-NO', 'mi ventana'],
        ['У меня есть брат', 'u mi-NYA yest BRAT', 'Tengo un hermano']
      ],
      questions: [
        { prompt: '«Mi hermana» es…', options: ['мой сестра', 'моя сестра', 'моё сестра'], answer: 1 },
        { prompt: '«Mi ventana» es…', options: ['мой окно', 'моя окно', 'моё окно'], answer: 2 },
        { prompt: '«Tengo un hermano» es…', options: ['Я есть брат', 'У меня есть брат', 'Мой есть брат'], answer: 1 },
        { prompt: 'мои va con…', options: ['un masculino', 'un femenino', 'un plural'], answer: 2 }
      ]
    }
  ];

  const dialogues = [
    {
      id: 'conocer',
      title: 'Conocerse',
      blurb: 'El primer minuto.',
      lines: [
        { speaker: 'Ana', ru: 'Здравствуйте!', tr: 'ZDRAST-vuy-tye', es: 'Hola.' },
        { speaker: 'Miguel', ru: 'Здравствуйте! Меня зовут Мигель.', tr: 'mi-NYA za-VUT', es: 'Hola. Me llamo Miguel.' },
        { speaker: 'Ana', ru: 'Очень приятно. Я Ана.', tr: 'O-chen pri-YAT-na', es: 'Mucho gusto. Soy Ana.' },
        { speaker: 'Miguel', ru: 'Я учу русский.', tr: 'ya u-CHU RUS-kiy', es: 'Estoy aprendiendo ruso.', blank: { answer: 'русский', options: ['русский', 'испанский', 'вода'] } }
      ]
    },
    {
      id: 'cafe',
      title: 'En el café',
      blurb: 'Pedir algo sencillo.',
      lines: [
        { speaker: 'Camarero', ru: 'Здравствуйте. Что вы будете?', tr: 'shto vy BU-di-tye', es: 'Hola. ¿Qué van a tomar?' },
        { speaker: 'Miguel', ru: 'Я буду кофе, пожалуйста.', tr: 'ya BU-du KO-fe', es: 'Un café, por favor.', blank: { answer: 'кофе', options: ['кофе', 'билет', 'брат'] } },
        { speaker: 'Camarero', ru: 'Ещё что-нибудь?', tr: 'yi-SHCHO shtO-ni-but', es: '¿Algo más?' },
        { speaker: 'Miguel', ru: 'Нет, спасибо.', tr: 'NYET spa-SI-ba', es: 'No, gracias.' }
      ]
    },
    {
      id: 'calle',
      title: 'Por la calle',
      blurb: 'Preguntar un sitio.',
      lines: [
        { speaker: 'Miguel', ru: 'Извините, где метро?', tr: 'GDYE mye-TRO', es: 'Disculpe, ¿dónde está el metro?' },
        { speaker: 'Ana', ru: 'Идите прямо, потом направо.', tr: 'i-DI-tye PRYA-ma', es: 'Siga recto y luego a la derecha.', blank: { answer: 'направо', options: ['направо', 'сегодня', 'молоко'] } },
        { speaker: 'Miguel', ru: 'Это далеко?', tr: 'E-ta da-li-KO', es: '¿Está lejos?' },
        { speaker: 'Ana', ru: 'Нет, рядом.', tr: 'NYET RYA-dam', es: 'No, al lado.' }
      ]
    },
    {
      id: 'tienda',
      title: 'En la tienda',
      blurb: 'Precio y pago.',
      lines: [
        { speaker: 'Miguel', ru: 'Сколько это стоит?', tr: 'SKOL-ka E-ta STO-it', es: '¿Cuánto cuesta?' },
        { speaker: 'Vendedora', ru: 'Двести рублей.', tr: 'DVYE-sti rub-LYEY', es: 'Doscientos rublos.' },
        { speaker: 'Miguel', ru: 'Хорошо, я беру.', tr: 'kha-ra-SHO ya bi-RU', es: 'Bien, me lo llevo.', blank: { answer: 'беру', options: ['беру', 'сплю', 'иду'] } },
        { speaker: 'Vendedora', ru: 'Спасибо.', tr: 'spa-SI-ba', es: 'Gracias.' }
      ]
    },
    {
      id: 'clase',
      title: 'En clase',
      blurb: 'Cuando no entiendes.',
      lines: [
        { speaker: 'Profesor', ru: 'Откройте тетрадь.', tr: 'at-KROY-tye tyit-RAT', es: 'Abrid el cuaderno.' },
        { speaker: 'Miguel', ru: 'Я не понимаю.', tr: 'ya nye pa-ni-MA-yu', es: 'No entiendo.' },
        { speaker: 'Profesor', ru: 'Повторите, пожалуйста.', tr: 'paf-ta-RI-tye', es: 'Repita, por favor.' },
        { speaker: 'Miguel', ru: 'Говорите медленнее, пожалуйста.', tr: 'ga-va-RI-tye MYED-lin-nye-ye', es: 'Hable más despacio, por favor.', blank: { answer: 'медленнее', options: ['медленнее', 'быстрее', 'дороже'] } }
      ]
    },
    {
      id: 'casa-dlg',
      title: 'En casa',
      blurb: 'Decir qué hay.',
      lines: [
        { speaker: 'Ana', ru: 'Где ключ?', tr: 'GDYE KLYUCH', es: '¿Dónde está la llave?' },
        { speaker: 'Miguel', ru: 'На столе.', tr: 'na sta-LYE', es: 'Sobre la mesa.', blank: { answer: 'столе', options: ['столе', 'маме', 'кофе'] } },
        { speaker: 'Ana', ru: 'Спасибо.', tr: 'spa-SI-ba', es: 'Gracias.' },
        { speaker: 'Miguel', ru: 'Пожалуйста.', tr: 'pa-ZHA-luy-sta', es: 'De nada.' }
      ]
    }
  ];

  const path = [
    { id: 'alfabeto', level: 'Sonidos', title: 'Alfabeto', detail: 'Mira las 33 letras', href: '#/letras', kind: 'letters', min: 20 },
    { id: 'silabas', level: 'Sonidos', title: 'Sílabas', detail: 'Consonante más vocal', href: '#/silabas', kind: 'flag' },
    { id: 'saludos', level: 'Primeras palabras', title: 'Saludos', detail: 'Repasa al menos 5', href: '#/mazos/saludos', kind: 'deck', deckId: 'saludos', min: 5 },
    { id: 'numeros', level: 'Primeras palabras', title: 'Números', detail: 'Del 1 al 20', href: '#/mazos/numeros', kind: 'deck', deckId: 'numeros', min: 5 },
    { id: 'frases', level: 'Primeras palabras', title: 'Frases', detail: 'Cuando aún no conversas', href: '#/mazos/frases', kind: 'deck', deckId: 'frases', min: 5 },
    { id: 'genero', level: 'Gramática', title: 'El género', detail: 'Masculino, femenino, neutro', href: '#/gramatica/genero', kind: 'flag' },
    { id: 'plural', level: 'Gramática', title: 'El plural', detail: 'El patrón regular', href: '#/gramatica/plural', kind: 'flag' },
    { id: 'presente', level: 'Gramática', title: 'El presente', detail: 'Las personas del verbo', href: '#/gramatica/presente', kind: 'flag' },
    { id: 'casos', level: 'Gramática', title: 'Dos casos', detail: 'Nominativo y acusativo', href: '#/gramatica/casos', kind: 'flag' },
    { id: 'posesion', level: 'Gramática', title: 'La posesión', detail: 'мой y у меня есть', href: '#/gramatica/posesion', kind: 'flag' },
    { id: 'familia', level: 'Temas', title: 'Familia', detail: 'Las personas de casa', href: '#/mazos/familia', kind: 'deck', deckId: 'familia', min: 4 },
    { id: 'comida', level: 'Temas', title: 'Comida', detail: 'Lo cotidiano de la mesa', href: '#/mazos/comida', kind: 'deck', deckId: 'comida', min: 4 },
    { id: 'viaje', level: 'Temas', title: 'Viaje', detail: 'Tren, metro, hotel', href: '#/mazos/viaje', kind: 'deck', deckId: 'viaje', min: 4 },
    { id: 'dialogos', level: 'Conversación', title: 'Diálogos', detail: 'Completa dos escenas', href: '#/dialogos', kind: 'dialogues', min: 2 }
  ];

  function stepDone(step, state, decks) {
    if (step.kind === 'letters') return Object.keys(state.seenLetters || {}).length >= step.min;
    if (step.kind === 'flag') return !!(state.pathDone && state.pathDone[step.id]);
    if (step.kind === 'dialogues') return !!(state.pathDone && state.pathDone.dialogos);
    if (step.kind === 'deck') {
      const deck = (decks || []).find(function (item) { return item.id === step.deckId; });
      if (!deck) return false;
      const reps = deck.cards.filter(function (card) {
        return state.srs && state.srs[card.id] && state.srs[card.id].reps > 0;
      }).length;
      return reps >= step.min;
    }
    return false;
  }

  root.RusoLessons = {
    syllables: syllables,
    grammar: grammar,
    dialogues: dialogues,
    path: path,
    stepDone: stepDone
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
