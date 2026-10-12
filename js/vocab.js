(function (root) {
  const data = root.RusoData;

  function pack(id, title, glyph, blurb, group, rows) {
    return {
      id: id,
      title: title,
      glyph: glyph,
      blurb: blurb,
      group: group,
      cards: rows.map(function (row, index) {
        const card = {
          id: id + '-' + String(index + 1).padStart(2, '0'),
          ru: row[0],
          tr: row[1],
          latin: row[2],
          es: row[3]
        };
        if (row[4]) card.note = row[4];
        if (row[5]) card.pos = row[5];
        return card;
      })
    };
  }

  const extra = [
    pack('familia', 'Familia', 'М', 'Las personas de casa.', 'Personas', [
      ['мама', 'MA-ma', 'mama', 'mamá'],
      ['папа', 'PA-pa', 'papa', 'papá'],
      ['брат', 'BRAT', 'brat', 'hermano'],
      ['сестра', 'sis-TRA', 'sestra', 'hermana'],
      ['сын', 'SYN', 'syn', 'hijo'],
      ['дочь', "DOCH'", 'doch', 'hija'],
      ['муж', 'MUSH', 'muzh', 'marido', 'La ж final suena sh.'],
      ['жена', 'zhe-NA', 'zhena', 'esposa'],
      ['ребёнок', 're-BYO-nak', 'rebyonok', 'niño / niña'],
      ['родители', 'ra-DI-te-li', 'roditeli', 'padres'],
      ['дедушка', 'DYE-dush-ka', 'dedushka', 'abuelo'],
      ['бабушка', 'BA-bush-ka', 'babushka', 'abuela'],
      ['дядя', 'DYA-dya', 'dyadya', 'tío'],
      ['тётя', 'TYO-tya', 'tyotya', 'tía'],
      ['семья', 'sim-YA', 'semya', 'familia']
    ]),
    pack('comida', 'Comida', 'Х', 'Lo que se come y se bebe.', 'Día a día', [
      ['молоко', 'ma-la-KO', 'moloko', 'leche'],
      ['мясо', 'MYA-sa', 'myaso', 'carne'],
      ['рыба', 'RY-ba', 'ryba', 'pescado'],
      ['суп', 'SUP', 'sup', 'sopa'],
      ['салат', 'sa-LAT', 'salat', 'ensalada'],
      ['яблоко', 'YA-bla-ka', 'yabloko', 'manzana'],
      ['сыр', 'SYR', 'syr', 'queso'],
      ['масло', 'MAS-la', 'maslo', 'mantequilla / aceite'],
      ['яйцо', 'yiy-TSO', 'yaytso', 'huevo'],
      ['сахар', 'SA-khar', 'sakhar', 'azúcar'],
      ['соль', 'SOL', 'sol', 'sal'],
      ['сок', 'SOK', 'sok', 'zumo'],
      ['рис', 'RIS', 'ris', 'arroz'],
      ['овощи', 'O-va-shchi', 'ovoshchi', 'verduras']
    ]),
    pack('viaje', 'Viaje', 'П', 'Para moverse de un sitio a otro.', 'Fuera', [
      ['билет', 'bi-LYET', 'bilet', 'billete'],
      ['поезд', 'PO-yist', 'poezd', 'tren'],
      ['самолёт', 'sa-ma-LYOT', 'samolet', 'avión'],
      ['автобус', 'af-TO-bus', 'avtobus', 'autobús'],
      ['метро', 'mye-TRO', 'metro', 'metro'],
      ['вокзал', 'vag-ZAL', 'vokzal', 'estación de tren'],
      ['аэропорт', 'ae-ra-PORT', 'aeroport', 'aeropuerto'],
      ['паспорт', 'PAS-part', 'pasport', 'pasaporte'],
      ['чемодан', 'chi-ma-DAN', 'chemodan', 'maleta'],
      ['отель', 'a-TEL', 'otel', 'hotel'],
      ['такси', 'tak-SI', 'taksi', 'taxi'],
      ['остановка', 'as-ta-NOF-ka', 'ostanovka', 'parada']
    ]),
    pack('tiempo', 'Tiempo', 'С', 'Días, meses y el momento.', 'Día a día', [
      ['понедельник', 'pa-ni-DYEL-nik', 'ponedelnik', 'lunes', '', 'dia'],
      ['вторник', 'FTOR-nik', 'vtornik', 'martes', '', 'dia'],
      ['среда', 'sri-DA', 'sreda', 'miércoles', '', 'dia'],
      ['четверг', 'chit-VERK', 'chetverg', 'jueves', '', 'dia'],
      ['пятница', 'PYAT-ni-tsa', 'pyatnitsa', 'viernes', '', 'dia'],
      ['суббота', 'su-BO-ta', 'subbota', 'sábado', '', 'dia'],
      ['воскресенье', 'vas-kri-SYEN-ye', 'voskresenye', 'domingo', '', 'dia'],
      ['январь', 'yan-VAR', 'yanvar', 'enero', '', 'mes'],
      ['февраль', 'fiv-RAL', 'fevral', 'febrero', '', 'mes'],
      ['март', 'MART', 'mart', 'marzo', '', 'mes'],
      ['апрель', 'ap-RYEL', 'aprel', 'abril', '', 'mes'],
      ['май', 'MAY', 'may', 'mayo', '', 'mes'],
      ['июнь', 'i-YUN', 'iyun', 'junio', '', 'mes'],
      ['июль', 'i-YUL', 'iyul', 'julio', '', 'mes'],
      ['август', 'AV-gust', 'avgust', 'agosto', '', 'mes'],
      ['сентябрь', 'sin-TYABR', 'sentyabr', 'septiembre', '', 'mes'],
      ['октябрь', 'ak-TYABR', 'oktyabr', 'octubre', '', 'mes'],
      ['ноябрь', 'na-YABR', 'noyabr', 'noviembre', '', 'mes'],
      ['декабрь', 'di-KABR', 'dekabr', 'diciembre', '', 'mes'],
      ['сегодня', 'si-VOD-nya', 'segodnya', 'hoy', '', 'momento'],
      ['завтра', 'ZAF-tra', 'zavtra', 'mañana', 'La в suena f delante de т.', 'momento'],
      ['вчера', 'fchi-RA', 'vchera', 'ayer', '', 'momento'],
      ['сейчас', 'siy-CHAS', 'seychas', 'ahora', '', 'momento'],
      ['час', 'CHAS', 'chas', 'hora', '', 'momento'],
      ['минута', 'mi-NU-ta', 'minuta', 'minuto', '', 'momento'],
      ['неделя', 'ni-DYE-lya', 'nedelya', 'semana', '', 'momento'],
      ['месяц', 'MYE-syats', 'mesyats', 'mes', '', 'momento'],
      ['год', 'GOT', 'god', 'año', 'La д final suena t.', 'momento']
    ]),
    pack('clima', 'Clima', 'С', 'Qué tiempo hace.', 'Día a día', [
      ['погода', 'pa-GO-da', 'pogoda', 'tiempo atmosférico'],
      ['солнце', 'SON-tse', 'solntse', 'sol'],
      ['дождь', "DOZHT'", 'dozhd', 'lluvia'],
      ['снег', 'SNYEK', 'sneg', 'nieve'],
      ['ветер', 'VYE-tyer', 'veter', 'viento'],
      ['облако', 'O-bla-ka', 'oblako', 'nube'],
      ['тепло', 'tip-LO', 'teplo', 'hace calor suave'],
      ['холодно', 'KHO-lad-na', 'kholodno', 'hace frío'],
      ['жарко', 'ZHAR-ka', 'zharko', 'hace calor'],
      ['туман', 'tu-MAN', 'tuman', 'niebla']
    ]),
    pack('casa', 'Casa', 'Д', 'Las habitaciones y los muebles.', 'Personas', [
      ['квартира', 'kvar-TI-ra', 'kvartira', 'piso'],
      ['комната', 'KOM-na-ta', 'komnata', 'habitación'],
      ['кухня', 'KUKH-nya', 'kukhnya', 'cocina'],
      ['ванная', 'VAN-na-ya', 'vannaya', 'baño'],
      ['спальня', 'SPAL-nya', 'spalnya', 'dormitorio'],
      ['стол', 'STOL', 'stol', 'mesa'],
      ['стул', 'STUL', 'stul', 'silla'],
      ['кровать', 'kra-VAT', 'krovat', 'cama'],
      ['окно', 'ak-NO', 'okno', 'ventana'],
      ['дверь', 'DVER', 'dver', 'puerta'],
      ['лампа', 'LAM-pa', 'lampa', 'lámpara'],
      ['ключ', 'KLYUCH', 'klyuch', 'llave']
    ]),
    pack('cuerpo', 'Cuerpo', 'Г', 'De la cabeza a los pies.', 'Personas', [
      ['голова', 'ga-la-VA', 'golova', 'cabeza'],
      ['глаз', 'GLAS', 'glaz', 'ojo'],
      ['ухо', 'U-kha', 'ukho', 'oreja'],
      ['нос', 'NOS', 'nos', 'nariz'],
      ['рот', 'ROT', 'rot', 'boca'],
      ['рука', 'ru-KA', 'ruka', 'mano / brazo'],
      ['нога', 'na-GA', 'noga', 'pie / pierna'],
      ['сердце', 'SYER-tse', 'serdtse', 'corazón'],
      ['зуб', 'ZUP', 'zub', 'diente'],
      ['волосы', 'VO-la-sy', 'volosy', 'pelo'],
      ['палец', 'PA-lyets', 'palets', 'dedo'],
      ['спина', 'spi-NA', 'spina', 'espalda']
    ]),
    pack('animales', 'Animales', 'К', 'Los que más se nombran.', 'Fuera', [
      ['кот', 'KOT', 'kot', 'gato'],
      ['собака', 'sa-BA-ka', 'sobaka', 'perro'],
      ['птица', 'PTI-tsa', 'ptitsa', 'pájaro'],
      ['лошадь', 'LO-shat', 'loshad', 'caballo'],
      ['корова', 'ka-RO-va', 'korova', 'vaca'],
      ['медведь', 'mid-VYET', 'medved', 'oso'],
      ['волк', 'VOLK', 'volk', 'lobo'],
      ['мышь', 'MYSH', 'mysh', 'ratón'],
      ['лиса', 'li-SA', 'lisa', 'zorro'],
      ['рыба', 'RY-ba', 'ryba', 'pez']
    ]),
    pack('compras', 'Compras', '₽', 'En la tienda.', 'Día a día', [
      ['магазин', 'ma-ga-ZIN', 'magazin', 'tienda'],
      ['деньги', 'DYEN-gi', 'dengi', 'dinero'],
      ['цена', 'tsi-NA', 'tsena', 'precio'],
      ['касса', 'KA-sa', 'kassa', 'caja'],
      ['пакет', 'pa-KYET', 'paket', 'bolsa'],
      ['размер', 'raz-MYER', 'razmer', 'talla'],
      ['дорого', 'DO-ra-ga', 'dorogo', 'caro'],
      ['дёшево', 'DYO-shi-va', 'dyoshevo', 'barato'],
      ['купить', 'ku-PIT', 'kupit', 'comprar'],
      ['продавать', 'pra-da-VAT', 'prodavat', 'vender'],
      ['открыто', 'at-KRY-ta', 'otkryto', 'abierto'],
      ['закрыто', 'za-KRY-ta', 'zakryto', 'cerrado']
    ]),
    pack('restaurante', 'Restaurante', 'М', 'Pedir y pagar.', 'Día a día', [
      ['меню', 'min-YU', 'menyu', 'carta'],
      ['счёт', 'SHCHYOT', 'schet', 'cuenta'],
      ['официант', 'afi-tsi-ANT', 'ofitsiant', 'camarero'],
      ['заказать', 'za-ka-ZAT', 'zakazat', 'pedir'],
      ['вкусно', 'FKUS-na', 'vkusno', 'está rico'],
      ['вино', 'vi-NO', 'vino', 'vino'],
      ['завтрак', 'ZAF-trak', 'zavtrak', 'desayuno'],
      ['обед', 'ab-YET', 'obed', 'comida del mediodía'],
      ['ужин', 'U-zhin', 'uzhin', 'cena'],
      ['ещё', 'yi-SHCHO', 'yeshcho', 'más / otro']
    ]),
    pack('direcciones', 'Direcciones', '→', 'Para no perderse.', 'Fuera', [
      ['где', 'GDYE', 'gde', 'dónde'],
      ['здесь', 'ZDYES', 'zdes', 'aquí'],
      ['там', 'TAM', 'tam', 'allí'],
      ['направо', 'na-PRA-va', 'napravo', 'a la derecha'],
      ['налево', 'na-LYE-va', 'nalevo', 'a la izquierda'],
      ['прямо', 'PRYA-ma', 'pryamo', 'recto'],
      ['рядом', 'RYA-dam', 'ryadom', 'al lado'],
      ['далеко', 'da-li-KO', 'daleko', 'lejos'],
      ['близко', 'BLIS-ka', 'blizko', 'cerca'],
      ['улица', 'U-li-tsa', 'ulitsa', 'calle'],
      ['площадь', 'PLO-shchat', 'ploshchad', 'plaza'],
      ['мост', 'MOST', 'most', 'puente']
    ]),
    pack('emociones', 'Emociones', 'Я', 'Cómo te sientes.', 'Personas', [
      ['счастливый', 'schas-LI-vyy', 'schastlivyy', 'feliz', 'Masculino. Femenino: счастливая.'],
      ['грустный', 'GRUST-nyy', 'grustnyy', 'triste'],
      ['злой', 'ZLOY', 'zloy', 'enfadado'],
      ['усталый', 'us-TA-lyy', 'ustalyy', 'cansado'],
      ['интересный', 'in-ti-RYES-nyy', 'interesnyy', 'interesante'],
      ['страшно', 'STRASH-na', 'strashno', 'da miedo'],
      ['спокойный', 'spa-KOY-nyy', 'spokoynyy', 'tranquilo'],
      ['скучный', 'SKUCH-nyy', 'skuchnyy', 'aburrido'],
      ['довольный', 'da-VOL-nyy', 'dovolnyy', 'contento'],
      ['одинокий', 'a-di-NO-kiy', 'odinokiy', 'solo']
    ]),
    pack('trabajo', 'Trabajo y clase', 'У', 'La escuela y el trabajo.', 'Estudio', [
      ['работа', 'ra-BO-ta', 'rabota', 'trabajo'],
      ['университет', 'u-ni-ver-si-TYET', 'universitet', 'universidad'],
      ['учитель', 'u-CHI-tyel', 'uchitel', 'profesor'],
      ['студент', 'stu-DYENT', 'student', 'estudiante'],
      ['урок', 'u-ROK', 'urok', 'clase'],
      ['тетрадь', 'tyit-RAT', 'tetrad', 'cuaderno'],
      ['ручка', 'RUCH-ka', 'ruchka', 'bolígrafo'],
      ['вопрос', 'vap-ROS', 'vopros', 'pregunta'],
      ['ответ', 'at-VYET', 'otvet', 'respuesta'],
      ['учиться', 'u-CHIT-sya', 'uchitsya', 'estudiar'],
      ['коллега', 'ka-LYE-ga', 'kollega', 'colega'],
      ['задание', 'za-DA-ni-ye', 'zadanie', 'tarea']
    ]),
    pack('adjetivos', 'Adjetivos', 'Б', 'Para describir.', 'Estudio', [
      ['большой', 'bal-SHOY', 'bolshoy', 'grande'],
      ['маленький', 'MA-lin-kiy', 'malenkiy', 'pequeño'],
      ['новый', 'NO-vyy', 'novyy', 'nuevo'],
      ['старый', 'STA-ryy', 'staryy', 'viejo'],
      ['хороший', 'kha-RO-shiy', 'khoroshiy', 'bueno'],
      ['плохой', 'pla-KHOY', 'plokhoy', 'malo'],
      ['красивый', 'kra-SI-vyy', 'krasivyy', 'bonito'],
      ['молодой', 'ma-la-DOY', 'molodoy', 'joven'],
      ['горячий', 'ga-RYA-chiy', 'goryachiy', 'caliente'],
      ['быстрый', 'BYS-tryy', 'bystryy', 'rápido'],
      ['медленный', 'MYED-lin-nyy', 'medlennyy', 'lento'],
      ['лёгкий', 'LYOKH-kiy', 'lyogkiy', 'fácil / ligero'],
      ['трудный', 'TRUD-nyy', 'trudnyy', 'difícil'],
      ['дешёвый', 'di-SHO-vyy', 'deshovyy', 'barato']
    ]),
    pack('preguntas', 'Preguntas', 'К', 'Las palabras que abren una frase.', 'Gramática', [
      ['кто', 'KTO', 'kto', 'quién'],
      ['что', 'SHTO', 'chto', 'qué', 'Se escribe что y suena shto.'],
      ['куда', 'ku-DA', 'kuda', 'adónde'],
      ['откуда', 'at-KU-da', 'otkuda', 'de dónde'],
      ['когда', 'kag-DA', 'kogda', 'cuándo'],
      ['почему', 'pa-chi-MU', 'pochemu', 'por qué'],
      ['зачем', 'za-CHEM', 'zachem', 'para qué'],
      ['как', 'KAK', 'kak', 'cómo'],
      ['какой', 'ka-KOY', 'kakoy', 'qué tipo de / cuál'],
      ['сколько', 'SKOL-ka', 'skolko', 'cuánto'],
      ['чей', 'CHEY', 'chey', 'de quién'],
      ['где', 'GDYE', 'gde', 'dónde']
    ]),
    pack('pronombres', 'Pronombres', 'Я', 'Quién hace la acción.', 'Gramática', [
      ['я', 'YA', 'ya', 'yo'],
      ['ты', 'TY', 'ty', 'tú'],
      ['он', 'ON', 'on', 'él'],
      ['она', 'a-NA', 'ona', 'ella'],
      ['оно', 'a-NO', 'ono', 'ello'],
      ['мы', 'MY', 'my', 'nosotros'],
      ['вы', 'VY', 'vy', 'vosotros / usted'],
      ['они', 'a-NI', 'oni', 'ellos / ellas'],
      ['меня', 'mi-NYA', 'menya', 'me / a mí'],
      ['тебя', 'ti-BYA', 'tebya', 'te / a ti'],
      ['его', 'ye-VO', 'ego', 'lo / su (de él)', 'Se escribe его y suena yevo.'],
      ['её', 'ye-YO', 'yeyo', 'la / su (de ella)'],
      ['мой', 'MOY', 'moy', 'mi (masculino)'],
      ['моя', 'ma-YA', 'moya', 'mi (femenino)'],
      ['моё', 'ma-YO', 'moyo', 'mi (neutro)'],
      ['мои', 'ma-I', 'moi', 'mis']
    ]),
    pack('preposiciones', 'Preposiciones', 'В', 'Las piezas pequeñas de la frase.', 'Gramática', [
      ['в', 'V', 'v', 'en / a', 'Я в доме: estoy en casa. в школу: a la escuela.'],
      ['на', 'NA', 'na', 'en / sobre', 'на столе: sobre la mesa. на работу: al trabajo.'],
      ['с', 'S', 's', 'con / desde', 'с братом: con el hermano. с работы: del trabajo.'],
      ['из', 'IZ', 'iz', 'de (origen)', 'из Испании: de España.'],
      ['к', 'K', 'k', 'hacia (persona o lugar)', 'к врачу: al médico.'],
      ['у', 'U', 'u', 'junto a / de alguien', 'у меня: yo tengo. у окна: junto a la ventana.'],
      ['о', 'O', 'o', 'sobre (un tema)', 'о работе: sobre el trabajo.'],
      ['для', 'DLYA', 'dlya', 'para', 'для тебя: para ti.'],
      ['без', 'BYEZ', 'bez', 'sin', 'без сахара: sin azúcar.'],
      ['до', 'DO', 'do', 'hasta / antes de', 'до школы: antes del colegio.'],
      ['после', 'POS-lye', 'posle', 'después de', 'после урока: después de clase.'],
      ['между', 'MYEZH-du', 'mezhdu', 'entre', 'между нами: entre nosotros.']
    ])
  ];

  const groups = {
    saludos: 'Primeros pasos',
    frases: 'Primeros pasos',
    numeros: 'Primeros pasos',
    colores: 'Primeros pasos',
    palabras: 'Primeros pasos'
  };
  data.decks.forEach(function (deck) {
    if (groups[deck.id]) deck.group = groups[deck.id];
  });
  extra.forEach(function (deck) { data.decks.push(deck); });
})(typeof globalThis !== 'undefined' ? globalThis : this);
