(function () {
  const data = window.RusoData;
  const text = window.RusoText;
  const store = window.RusoStore;
  const speech = window.RusoSpeech;
  const esc = text.esc;

  const memory = {
    flipped: false,
    letterFilter: 'all',
    quiz: null
  };

  function icon(name) {
    const pen = 'viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
    if (name === 'back') {
      return '<svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10l8 8"/></svg>';
    }
    if (name === 'home') {
      return '<svg ' + pen + '><path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1Z"/></svg>';
    }
    if (name === 'letters') {
      return '<svg ' + pen + '><path d="M4 19 12 4l8 15"/><path d="M7.2 13.5h9.6"/></svg>';
    }
    if (name === 'words') {
      return '<svg ' + pen + '><path d="M6 4.5h9.2A1.8 1.8 0 0 1 17 6.3V20H8.2A2.2 2.2 0 0 0 6 22.2V4.5Z"/><path d="M6 18.2h11"/></svg>';
    }
    if (name === 'gear') {
      return '<svg ' + pen + '><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.8 5.8l1.4 1.4M16.8 16.8l1.4 1.4M18.2 5.8l-1.4 1.4M7.2 16.8l-1.4 1.4"/></svg>';
    }
    return '<svg ' + pen + '><path d="M4 10h3.2L12 6v12l-4.8-4H4v-4Z"/><path d="M16 9.2a3.6 3.6 0 0 1 0 5.6"/></svg>';
  }

  function parseRoute() {
    try {
      const raw = decodeURIComponent((location.hash || '#/').replace(/^#/, ''));
      const parts = raw.split('/').filter(Boolean);
      if (!parts.length) return { name: 'home' };
      if (parts[0] === 'letras') {
        return parts[1] ? { name: 'letter', id: parts[1] } : { name: 'letters' };
      }
      if (parts[0] === 'mazos') {
        if (!parts[1]) return { name: 'decks' };
        if (parts[2] === 'tarjetas') return { name: 'cards', deckId: parts[1] };
        if (parts[2] === 'practica') return { name: 'quiz', deckId: parts[1] };
        return { name: 'deck', deckId: parts[1] };
      }
      if (parts[0] === 'ajustes') return { name: 'settings' };
      return { name: 'missing' };
    } catch (error) {
      return { name: 'missing' };
    }
  }

  function go(hash) {
    if (location.hash !== hash) location.hash = hash;
    else render();
  }

  function findDeck(id) {
    return data.decks.find(function (deck) { return deck.id === id; }) || null;
  }

  function findLetter(id) {
    return data.alphabet.find(function (letter) { return letter.id === id; }) || null;
  }

  function findCard(deck, id) {
    return deck.cards.find(function (card) { return card.id === id; }) || null;
  }

  function knownCount(state, deck) {
    return deck.cards.filter(function (card) { return state.known[card.id]; }).length;
  }

  function deckIndex(state, deck) {
    const slot = state.deckState[deck.id];
    const raw = slot ? slot.index : 0;
    const n = typeof raw === 'number' && isFinite(raw) ? raw : 0;
    return Math.max(0, Math.min(deck.cards.length, n));
  }

  function directionOf(state, deckId) {
    const slot = state.deckState[deckId];
    return slot && slot.direction === 'es-ru' ? 'es-ru' : 'ru-es';
  }

  function quizModeOf(state, deckId) {
    const slot = state.deckState[deckId];
    return slot && slot.quizMode === 'type' ? 'type' : 'choice';
  }

  function setDeckPref(deckId, patch) {
    memory.flipped = false;
    store.update(function (state) {
      state.deckState[deckId] = Object.assign(
        { index: 0, direction: 'ru-es', quizMode: 'choice' },
        state.deckState[deckId] || {},
        patch
      );
    });
    render();
  }

  function greeting(date) {
    const hour = date.getHours();
    if (hour < 5 || hour >= 20) return 'Buenas noches';
    if (hour < 12) return 'Buenos días';
    return 'Buenas tardes';
  }

  function formatStudyDate(iso) {
    if (!iso) return 'Aún no';
    const today = store.todayKey();
    if (iso === today) return 'Hoy';
    if (iso === store.prevDate(today)) return 'Ayer';
    const parts = iso.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }

  function isDark(theme) {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(theme) {
    const value = theme || store.load().theme || 'system';
    if (value === 'light' || value === 'dark') document.documentElement.setAttribute('data-theme', value);
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark(value) ? '#000000' : '#F2F2F7');
  }

  function bar(pct) {
    const value = Math.max(0, Math.min(100, Math.round(pct)));
    return '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value + '"><span style="width:' + value + '%"></span></div>';
  }

  function helpHtml() {
    return '<details class="help group"><summary>Cómo se lee la pronunciación</summary><p>Las mayúsculas marcan el acento. Los guiones separan sílabas. <b>kh</b> suena como la j de «jamón», <b>zh</b> como la j francesa y <b>sh</b> como en «show».</p></details>';
  }

  function shell(options) {
    const back = options.back
      ? '<a class="back" href="' + options.back + '">' + icon('back') + '<span>Atrás</span></a>'
      : '';
    const large = options.large
      ? '<header class="hero"><div class="hero-top"><div><h1>' + esc(options.large) + '</h1>' +
        (options.sub ? '<p>' + esc(options.sub) + '</p>' : '') +
        '</div>' + (options.pill ? '<div class="pill">' + esc(options.pill) + '</div>' : '') +
        '</div></header>'
      : '<h1 class="sr-only">' + esc(options.title) + '</h1>';
    return '<div class="pane"><div class="toolbar' + (options.pushed ? ' is-pushed' : '') + '">' +
      back + '<div class="inline-title"><span>' + esc(options.title) + '</span></div></div>' +
      large + options.body + '</div>';
  }

  function resolvePlace(state) {
    const place = state.lastPlace;
    if (!place || typeof place !== 'object') return null;
    if (place.type === 'letter') {
      const letter = findLetter(place.letterId);
      return letter ? { type: 'letter', letter: letter } : null;
    }
    const deck = findDeck(place.deckId);
    if (!deck) return null;
    return { type: 'deck', deck: deck, mode: place.mode || 'cards' };
  }

  function continueHtml(state) {
    const place = resolvePlace(state);
    if (!place) return '';
    if (place.type === 'letter') {
      const letter = place.letter;
      return '<section class="continue"><div class="kicker-row"><p class="eyebrow">Seguir</p><p class="eyebrow">Alfabeto</p></div>' +
        '<p class="word" lang="ru">' + esc(letter.upper) + ' ' + esc(letter.lower) + '</p>' +
        '<p class="tr">' + esc(letter.hint) + '</p>' +
        '<a class="btn btn-fill" href="#/letras/' + encodeURIComponent(letter.id) + '">Continuar</a></section>';
    }
    const deck = place.deck;
    const index = deckIndex(state, deck);
    const known = knownCount(state, deck);
    const done = index >= deck.cards.length;
    const card = deck.cards[Math.min(index, deck.cards.length - 1)];
    const href = place.mode === 'quiz'
      ? '#/mazos/' + deck.id + '/practica'
      : place.mode === 'deck'
        ? '#/mazos/' + deck.id
        : '#/mazos/' + deck.id + '/tarjetas';
    const action = place.mode === 'quiz' ? ' data-action="open-quiz" data-deck="' + deck.id + '"' : '';
    const label = place.mode === 'quiz' ? 'Seguir la práctica' : place.mode === 'deck' ? 'Abrir mazo' : 'Continuar';
    return '<section class="continue"><div class="kicker-row"><p class="eyebrow">Seguir</p><p class="eyebrow">' + esc(deck.title) + '</p></div>' +
      '<p class="word" lang="ru">' + (done ? 'Mazo recorrido' : esc(card.ru)) + '</p>' +
      '<p class="tr">' + (done ? known + ' de ' + deck.cards.length + ' sabidas' : esc(card.tr)) + '</p>' +
      bar(deck.cards.length ? (known / deck.cards.length) * 100 : 0) +
      '<a class="btn btn-fill" href="' + href + '"' + action + '>' + label + '</a></section>';
  }

  function studyRows(state) {
    const seen = Object.keys(state.seenLetters).length;
    const alphabet = '<a class="row has-mark" href="#/letras"><span class="mark" lang="ru">А</span><span class="row-main"><span class="row-title">Alfabeto</span><span class="row-sub">33 letras, sonido y nota</span></span><span class="row-meta">' + seen + '/33</span><span class="chev" aria-hidden="true"></span></a>';
    const decks = data.decks.map(function (deck) {
      const known = knownCount(state, deck);
      return '<a class="row has-mark" href="#/mazos/' + deck.id + '"><span class="mark" lang="ru">' + esc(deck.glyph) + '</span><span class="row-main"><span class="row-title">' + esc(deck.title) + '</span><span class="row-sub">' + esc(deck.blurb) + '</span></span><span class="row-meta">' + known + '/' + deck.cards.length + '</span><span class="chev" aria-hidden="true"></span></a>';
    }).join('');
    return alphabet + decks;
  }

  function statsHtml(state) {
    const seen = Object.keys(state.seenLetters).length;
    const practice = state.quizAnswered ? state.quizCorrect + '/' + state.quizAnswered : '—';
    const streak = state.streak ? (state.streak === 1 ? '1 día' : state.streak + ' días') : '—';
    return '<h2 class="group-label">Progreso</h2><div class="stats">' +
      '<div class="stat"><b>' + esc(streak) + '</b><span>Racha</span></div>' +
      '<div class="stat"><b>' + state.reviews + '</b><span>Repasos</span></div>' +
      '<div class="stat"><b>' + esc(practice) + '</b><span>Aciertos</span></div>' +
      '<div class="stat"><b>' + seen + '/33</b><span>Letras</span></div></div>';
  }

  function renderHome() {
    const state = store.load();
    const pill = state.streak ? (state.streak === 1 ? '1 día' : state.streak + ' días') : '';
    const body = continueHtml(state) +
      '<h2 class="group-label">Estudiar</h2><div class="group">' + studyRows(state) + '</div>' +
      statsHtml(state);
    return shell({
      title: 'Inicio',
      large: 'Estudio',
      sub: greeting(new Date()) + ', Miguel',
      pill: pill,
      body: body
    });
  }

  function renderLetters() {
    const state = store.load();
    const filter = memory.letterFilter;
    const labels = [
      ['all', 'Todas'],
      ['vowel', 'Vocales'],
      ['consonant', 'Consonantes'],
      ['sign', 'Signos']
    ];
    const segmented = '<div class="inset"><div class="segmented tight" role="radiogroup" aria-label="Filtrar letras">' +
      labels.map(function (item) {
        const on = filter === item[0];
        return '<button type="button" role="radio" aria-checked="' + on + '" data-action="filter" data-filter="' + item[0] + '">' + item[1] + '</button>';
      }).join('') + '</div></div>';
    const letters = data.alphabet.filter(function (letter) {
      return filter === 'all' || letter.group === filter;
    }).map(function (letter) {
      const seen = state.seenLetters[letter.id] ? ' is-seen' : '';
      const seenText = state.seenLetters[letter.id] ? ' Ya vista.' : '';
      return '<a class="letter' + seen + '" href="#/letras/' + encodeURIComponent(letter.id) + '" aria-label="' + esc(letter.upper + ' ' + letter.lower + ', ' + letter.name + '.' + seenText) + '"><span class="ru" lang="ru"><b>' + esc(letter.upper) + '</b><span>' + esc(letter.lower) + '</span></span><span class="ph">' + esc(letter.tr) + '</span></a>';
    }).join('');
    const body = '<p class="alias">Toca una letra para la nota en español y, si se puede, oírla.</p>' +
      segmented + '<div class="letters">' + letters + '</div>' + helpHtml();
    return shell({ title: 'Alfabeto', large: 'Alfabeto', sub: '33 letras desde cero', body: body });
  }

  function renderLetter(route) {
    const letter = findLetter(route.id);
    if (!letter) return renderMissing('Esa letra no está en el alfabeto.');
    const index = data.alphabet.findIndex(function (item) { return item.id === letter.id; });
    const prev = data.alphabet[(index - 1 + data.alphabet.length) % data.alphabet.length];
    const next = data.alphabet[(index + 1) % data.alphabet.length];
    const groupName = letter.group === 'vowel' ? 'Vocal' : letter.group === 'sign' ? 'Signo' : 'Consonante';
    const canSpeak = speech.supported();
    const body = '<p class="giant" lang="ru"><span>' + esc(letter.upper) + '</span><span class="lower">' + esc(letter.lower) + '</span></p>' +
      '<p class="alias">Se llama «' + esc(letter.name) + '» · ' + groupName + '</p>' +
      '<h2 class="group-label">Suena así</h2><div class="group"><div class="copy">' + esc(letter.hint) + '</div></div>' +
      '<h2 class="group-label">Nota</h2><div class="group"><div class="copy">' + esc(letter.note) + '</div></div>' +
      '<h2 class="group-label">Ejemplo</h2><div class="group"><div class="copy"><div lang="ru">' + esc(letter.example.ru) + '</div><div class="tr">' + esc(letter.example.tr) + ' · ' + esc(letter.example.es) + '</div></div></div>' +
      '<button type="button" class="listen" data-action="speak" data-text="' + esc(letter.speak) + '"' + (canSpeak ? '' : ' disabled') + '>' + icon('speaker') + 'Escuchar</button>' +
      '<p class="speech-note">' + (canSpeak ? 'Usa la voz rusa del sistema.' : 'Este navegador no puede leer en voz alta.') + '</p>' +
      '<div class="pair"><a class="btn btn-gray" href="#/letras/' + encodeURIComponent(prev.id) + '">' + esc(prev.upper) + ' anterior</a><a class="btn btn-fill" href="#/letras/' + encodeURIComponent(next.id) + '">Siguiente ' + esc(next.upper) + '</a></div>';
    return shell({
      pushed: true,
      back: '#/letras',
      title: letter.upper + ' ' + letter.lower,
      body: body
    });
  }

  function renderDecks() {
    const state = store.load();
    const rows = data.decks.map(function (deck) {
      const known = knownCount(state, deck);
      return '<a class="row has-mark" href="#/mazos/' + deck.id + '"><span class="mark" lang="ru">' + esc(deck.glyph) + '</span><span class="row-main"><span class="row-title">' + esc(deck.title) + '</span><span class="row-sub">' + deck.cards.length + ' · ' + known + ' sabidas</span></span><span class="chev" aria-hidden="true"></span></a>';
    }).join('');
    const body = '<div class="group">' + rows + '</div>' + helpHtml();
    return shell({
      title: 'Palabras',
      large: 'Palabras',
      sub: 'Cinco mazos cortos',
      body: body
    });
  }

  function wordRows(deck, state) {
    const groups = [];
    deck.cards.forEach(function (card, index) {
      const key = card.pos || 'all';
      let group = groups[groups.length - 1];
      if (!group || group.key !== key) {
        group = { key: key, items: [] };
        groups.push(group);
      }
      group.items.push({ card: card, index: index });
    });
    return groups.map(function (group) {
      const label = group.key === 'verb' ? 'Verbos' : group.key === 'noun' ? 'Sustantivos' : 'En el mazo';
      const rows = group.items.map(function (item) {
        const card = item.card;
        const known = state.known[card.id];
        return '<a class="row" href="#/mazos/' + deck.id + '/tarjetas" data-action="jump" data-deck="' + deck.id + '" data-index="' + item.index + '"><span class="row-main"><span class="row-title" lang="ru">' + esc(card.ru) + '</span><span class="row-sub">' + esc(card.tr) + '</span></span><span class="row-side"><span class="row-es">' + esc(card.es) + '</span>' + (known ? '<span class="tick" aria-label="Sabida">✓</span>' : '') + '</span></a>';
      }).join('');
      return '<h2 class="group-label">' + label + '</h2><div class="group">' + rows + '</div>';
    }).join('');
  }

  function segmented(name, value, options) {
    return '<div class="segmented" role="radiogroup" aria-label="' + esc(name) + '">' + options.map(function (item) {
      const on = value === item[0];
      return '<button type="button" role="radio" aria-checked="' + on + '" data-action="pref" data-deck="' + item[2] + '" data-key="' + item[3] + '" data-value="' + item[0] + '">' + item[1] + '</button>';
    }).join('') + '</div>';
  }

  function renderDeck(route) {
    const deck = findDeck(route.deckId);
    if (!deck) return renderMissing('Ese mazo no está.');
    const state = store.load();
    const direction = directionOf(state, deck.id);
    const mode = quizModeOf(state, deck.id);
    const known = knownCount(state, deck);
    const inProgress = memory.quiz && memory.quiz.deckId === deck.id && memory.quiz.phase !== 'result';
    const body = '<p class="alias">' + esc(deck.blurb) + ' · ' + known + ' de ' + deck.cards.length + ' sabidas.</p>' +
      '<div class="inset">' + segmented('Dirección', direction, [
        ['ru-es', 'RU → ES', deck.id, 'direction'],
        ['es-ru', 'ES → RU', deck.id, 'direction']
      ]) + '</div>' +
      '<div class="inset"><a class="btn btn-fill" style="width:100%" href="#/mazos/' + deck.id + '/tarjetas">Estudiar tarjetas</a></div>' +
      '<h2 class="group-label">Práctica</h2><div class="inset">' + segmented('Tipo de práctica', mode, [
        ['choice', 'Opciones', deck.id, 'quizMode'],
        ['type', 'Escribir', deck.id, 'quizMode']
      ]) + '</div>' +
      '<div class="inset"><button type="button" class="btn btn-gray" style="width:100%" data-action="open-quiz" data-deck="' + deck.id + '">' + (inProgress ? 'Seguir práctica' : 'Empezar práctica') + '</button></div>' +
      (inProgress ? '<div class="inset"><button type="button" class="linkish" data-action="restart-quiz" data-deck="' + deck.id + '">Empezar de nuevo</button></div>' : '') +
      wordRows(deck, state) + helpHtml();
    return shell({
      pushed: true,
      back: '#/mazos',
      title: deck.title,
      body: body
    });
  }

  function faceRu(card, front) {
    return '<div class="face ' + (front ? 'face-front' : 'face-back') + '" aria-hidden="true"><p class="kicker">Ruso</p><p class="word" lang="ru">' + esc(card.ru) + '</p><p class="tr">' + esc(card.tr) + '</p>' +
      (card.note && !front ? '<p class="note">' + esc(card.note) + '</p>' : '') +
      (front ? '<p class="hint">Toca para voltear</p>' : '') + '</div>';
  }

  function faceEs(card, front) {
    return '<div class="face ' + (front ? 'face-front' : 'face-back') + '" aria-hidden="true"><p class="kicker">Español</p><p class="word">' + esc(card.es) + '</p>' +
      (card.note && !front ? '<p class="note">' + esc(card.note) + '</p>' : '') +
      (front ? '<p class="hint">Toca para voltear</p>' : '') + '</div>';
  }

  function renderCards(route) {
    const deck = findDeck(route.deckId);
    if (!deck) return renderMissing('Ese mazo no está.');
    const state = store.load();
    const index = deckIndex(state, deck);
    if (index >= deck.cards.length) {
      const known = knownCount(state, deck);
      const body = '<section class="finished"><p class="eyebrow">' + esc(deck.title) + '</p><h2>Has recorrido el mazo</h2><p class="result-copy">Marcaste ' + known + ' de ' + deck.cards.length + ' como sabidas. Puedes pasarlas otra vez o hacer la práctica.</p></section>';
      return shell({ pushed: true, back: '#/mazos/' + deck.id, title: deck.title, body: body });
    }
    const card = deck.cards[index];
    const direction = directionOf(state, deck.id);
    const frontRu = direction !== 'es-ru';
    const frontLabel = frontRu
      ? card.ru + '. Pronunciación ' + card.tr + '. Pulsa para ver el español.'
      : card.es + '. Pulsa para ver el ruso.';
    const backLabel = frontRu
      ? card.es + '. Pulsa para volver al ruso.'
      : card.ru + '. Pronunciación ' + card.tr + '. Pulsa para volver.';
    const faces = frontRu ? faceRu(card, true) + faceEs(card, false) : faceEs(card, true) + faceRu(card, false);
    const canSpeak = speech.supported();
    const known = state.known[card.id] ? '<div class="inset" style="margin-top:8px;margin-bottom:0"><span class="known-flag">La sabes</span></div>' : '';
    const body = '<div class="card-tools"><button type="button" class="linkish" data-action="move" data-delta="-1"' + (index === 0 ? ' disabled' : '') + '>Anterior</button><p>' + (index + 1) + ' de ' + deck.cards.length + '</p></div>' +
      '<div class="inset">' + segmented('Dirección de la tarjeta', direction, [
        ['ru-es', 'RU → ES', deck.id, 'direction'],
        ['es-ru', 'ES → RU', deck.id, 'direction']
      ]) + '</div>' +
      '<div class="flip"><div class="flip-inner' + (memory.flipped ? ' is-flipped' : '') + '" data-action="flip" role="button" tabindex="0" aria-pressed="' + memory.flipped + '" aria-label="' + esc(memory.flipped ? backLabel : frontLabel) + '" data-front-label="' + esc(frontLabel) + '" data-back-label="' + esc(backLabel) + '">' + faces + '</div></div>' +
      known +
      '<button type="button" class="listen" data-action="speak" data-text="' + esc(card.ru) + '"' + (canSpeak ? '' : ' disabled') + '>' + icon('speaker') + 'Escuchar</button>' +
      '<p class="speech-note">' + (canSpeak ? 'La voz dice el ruso, esté del lado que esté la tarjeta.' : 'Sin voz en este navegador. La pronunciación está en la tarjeta.') + '</p>';
    return shell({ pushed: true, back: '#/mazos/' + deck.id, title: deck.title, body: body });
  }

  function buildQuiz(deck) {
    const state = store.load();
    const ids = text.shuffle(deck.cards.map(function (card) { return card.id; })).slice(0, Math.min(10, deck.cards.length));
    return {
      deckId: deck.id,
      mode: quizModeOf(state, deck.id),
      direction: directionOf(state, deck.id),
      order: ids,
      index: 0,
      score: 0,
      phase: 'ask',
      picked: null,
      correct: null,
      given: '',
      missed: [],
      choiceIds: null,
      choiceKey: null
    };
  }

  function ensureQuiz(deck) {
    const state = store.load();
    const mode = quizModeOf(state, deck.id);
    const direction = directionOf(state, deck.id);
    const quiz = memory.quiz;
    const fresh = quiz && quiz.deckId === deck.id && quiz.phase === 'ask' && quiz.index === 0 &&
      (quiz.mode !== mode || quiz.direction !== direction);
    if (!quiz || quiz.deckId !== deck.id || fresh) memory.quiz = buildQuiz(deck);
    return memory.quiz;
  }

  function currentQuizCard(deck, quiz) {
    return findCard(deck, quiz.order[quiz.index]);
  }

  function ensureChoices(deck, quiz) {
    if (quiz.mode !== 'choice' || quiz.phase === 'result') return;
    if (quiz.choiceKey === quiz.index && quiz.choiceIds) return;
    const card = currentQuizCard(deck, quiz);
    const side = quiz.direction === 'ru-es' ? 'es' : 'ru';
    quiz.choiceIds = text.buildChoices(deck.cards, card, side).map(function (item) { return item.id; });
    quiz.choiceKey = quiz.index;
  }

  function renderQuiz(route) {
    const deck = findDeck(route.deckId);
    if (!deck) return renderMissing('Ese mazo no está.');
    const quiz = ensureQuiz(deck);
    if (quiz.phase === 'result') return renderResult(deck, quiz);
    ensureChoices(deck, quiz);
    const card = currentQuizCard(deck, quiz);
    const askRu = quiz.direction !== 'es-ru';
    const prompt = askRu
      ? '<p class="prompt" lang="ru">' + esc(card.ru) + '</p>'
      : '<p class="prompt">' + esc(card.es) + '</p>';
    const canSpeak = speech.supported();
    let control = '';
    if (quiz.mode === 'type' && quiz.phase === 'ask') {
      const lang = askRu ? 'es' : 'ru';
      control = '<form id="quiz-form"><input id="answer" class="field" name="answer" lang="' + lang + '" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="' + (askRu ? 'Escribe en español' : 'Cirílico o transliteración') + '" aria-label="Tu respuesta"><p class="field-hint">' + (askRu ? 'Sin preocuparte por los acentos.' : 'Vale el cirílico o letras latinas.') + '</p></form>';
    }
    if (quiz.mode === 'choice') {
      const side = askRu ? 'es' : 'ru';
      const locked = quiz.phase === 'answered';
      control = '<div class="group" role="group" aria-label="Opciones">' + quiz.choiceIds.map(function (id) {
        const option = findCard(deck, id);
        const classes = ['option'];
        if (locked && id === card.id) classes.push('is-correct');
        if (locked && quiz.picked === id && id !== card.id) classes.push('is-wrong');
        const shown = side === 'es' ? option.es : option.ru;
        return '<button type="button" class="' + classes.join(' ') + '" data-action="pick" data-id="' + esc(id) + '"' + (locked ? ' disabled' : '') + (side === 'ru' ? ' lang="ru"' : '') + '>' + esc(shown) + '</button>';
      }).join('') + '</div>';
    }
    let feedback = '';
    if (quiz.phase === 'answered') {
      const good = quiz.correct;
      feedback = '<div class="feedback ' + (good ? 'is-good' : 'is-bad') + '" role="status"><strong>' + (good ? 'Correcto' : 'No era esa') + '</strong><p lang="ru">' + esc(card.ru) + '</p><p>' + esc(card.tr) + ' · ' + esc(card.es) + '</p>' +
        (quiz.given ? '<p>Escribiste: ' + esc(quiz.given) + '</p>' : '') + '</div>';
    }
    const caption = (quiz.mode === 'type' ? 'Escribir' : 'Opciones') + ' · ' + (askRu ? 'ruso → español' : 'español → ruso');
    const body = '<div class="card-tools"><span></span><p>Pregunta ' + (quiz.index + 1) + ' de ' + quiz.order.length + '</p></div>' +
      '<section class="quiz-card"><p class="eyebrow">' + esc(caption) + '</p>' + prompt +
      '<button type="button" class="listen" data-action="speak" data-text="' + esc(card.ru) + '"' + (canSpeak ? '' : ' disabled') + '>' + icon('speaker') + 'Escuchar</button>' +
      control + '</section>' + feedback;
    return shell({ pushed: true, back: '#/mazos/' + deck.id, title: 'Práctica', body: body });
  }

  function renderResult(deck, quiz) {
    const total = quiz.order.length;
    const ratio = total ? quiz.score / total : 0;
    const headline = ratio >= 0.8 ? 'Muy bien' : ratio >= 0.5 ? 'Vas bien' : 'Conviene repasarlo';
    const missed = quiz.missed.map(function (id) { return findCard(deck, id); }).filter(Boolean);
    const list = missed.length
      ? '<h2 class="group-label">Para repasar</h2><div class="group">' + missed.map(function (card) {
        return '<div class="row static"><span class="row-main"><span class="row-title" lang="ru">' + esc(card.ru) + '</span><span class="row-sub">' + esc(card.tr) + '</span></span><span class="row-es">' + esc(card.es) + '</span></div>';
      }).join('') + '</div>'
      : '<h2 class="group-label">Para repasar</h2><div class="group"><div class="row static"><span class="row-main"><span class="row-title">Sin fallos en esta sesión</span></span></div></div>';
    const body = '<section class="quiz-card"><p class="eyebrow">' + esc(deck.title) + '</p><p class="score">' + quiz.score + '<span>/' + total + '</span></p><p class="result-copy">' + headline + '. Has acertado ' + quiz.score + ' de ' + total + '.</p><div class="stack"><button type="button" class="btn btn-fill" data-action="restart-quiz" data-deck="' + deck.id + '">Otra vez</button><a class="btn btn-gray" href="#/mazos/' + deck.id + '/tarjetas">Ver tarjetas</a></div></section>' + list;
    return shell({ pushed: true, back: '#/mazos/' + deck.id, title: 'Resultado', body: body });
  }

  function renderSettings() {
    const state = store.load();
    const theme = state.theme || 'system';
    const themes = [['system', 'Sistema'], ['light', 'Claro'], ['dark', 'Oscuro']];
    const segmentedTheme = '<div class="inset"><div class="segmented" role="radiogroup" aria-label="Apariencia">' +
      themes.map(function (item) {
        return '<button type="button" role="radio" aria-checked="' + (theme === item[0]) + '" data-action="theme" data-theme="' + item[0] + '">' + item[1] + '</button>';
      }).join('') + '</div></div>';
    const seen = Object.keys(state.seenLetters).length;
    const practice = state.quizAnswered ? state.quizCorrect + ' de ' + state.quizAnswered : 'Aún no';
    function info(label, value) {
      return '<div class="row static"><span class="row-main"><span class="row-title">' + label + '</span></span><span class="row-meta">' + esc(value) + '</span></div>';
    }
    const body = '<h2 class="group-label">Apariencia</h2>' + segmentedTheme +
      '<h2 class="group-label">Progreso</h2><div class="group">' +
      info('Racha', state.streak ? (state.streak === 1 ? '1 día' : state.streak + ' días') : 'Sin racha') +
      info('Mejor racha', state.bestStreak ? (state.bestStreak === 1 ? '1 día' : state.bestStreak + ' días') : '—') +
      info('Última sesión', formatStudyDate(state.lastStudyDate)) +
      info('Repasos', String(state.reviews)) +
      info('Aciertos', practice) +
      info('Prácticas terminadas', String(state.quizzes)) +
      info('Letras vistas', seen + ' de 33') +
      '</div>' +
      '<h2 class="group-label">Datos</h2><div class="group"><button type="button" class="row danger-row" data-action="open-reset">Restablecer progreso</button></div>' +
      '<h2 class="group-label">En el iPhone</h2><div class="group"><div class="about"><p>En Safari, pulsa Compartir y luego «Añadir a pantalla de inicio».</p><p class="sw-status">Ábrela con conexión una vez para poder usarla sin red.</p><p>Si no oyes el ruso, descarga una voz en Ajustes → Accesibilidad → Contenido leído → Voces.</p></div></div>' +
      '<h2 class="group-label">Acerca de</h2><div class="group"><div class="about"><p>Estudio Ruso, versión 1. Hecho para Miguel.</p><p>Sin cuenta y sin analítica. El progreso vive solo en este navegador.</p></div></div>';
    return shell({ title: 'Ajustes', large: 'Ajustes', sub: 'En este dispositivo', body: body });
  }

  function renderMissing(message) {
    const body = '<section class="finished"><h2>No está aquí</h2><p class="result-copy">' + esc(message || 'Esa pantalla no existe.') + '</p><div class="stack"><a class="btn btn-fill" href="#/">Volver al inicio</a></div></section>';
    return shell({ pushed: true, back: '#/', title: 'Estudio', body: body });
  }

  function view(route) {
    if (route.name === 'home') return renderHome();
    if (route.name === 'letters') return renderLetters();
    if (route.name === 'letter') return renderLetter(route);
    if (route.name === 'decks') return renderDecks();
    if (route.name === 'deck') return renderDeck(route);
    if (route.name === 'cards') return renderCards(route);
    if (route.name === 'quiz') return renderQuiz(route);
    if (route.name === 'settings') return renderSettings();
    return renderMissing();
  }

  function titleFor(route) {
    if (route.name === 'home') return 'Inicio';
    if (route.name === 'letters' || route.name === 'letter') return 'Alfabeto';
    if (route.name === 'settings') return 'Ajustes';
    if (route.name === 'quiz') return 'Práctica';
    if (route.name === 'deck' || route.name === 'cards') {
      const deck = findDeck(route.deckId);
      return deck ? deck.title : 'Palabras';
    }
    return 'Palabras';
  }

  function tabKey(route) {
    if (route.name === 'home') return 'home';
    if (route.name === 'letters' || route.name === 'letter') return 'letters';
    if (route.name === 'settings') return 'settings';
    if (route.name === 'missing') return '';
    return 'decks';
  }

  function tabs(route) {
    const current = tabKey(route);
    const items = [
      ['home', '#/', 'Inicio', 'home'],
      ['letters', '#/letras', 'Letras', 'letters'],
      ['decks', '#/mazos', 'Palabras', 'words'],
      ['settings', '#/ajustes', 'Ajustes', 'gear']
    ];
    return '<nav class="tabs" aria-label="Secciones">' + items.map(function (item) {
      const on = current === item[0];
      return '<a class="tab" href="' + item[1] + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(item[3]) + '<span>' + item[2] + '</span></a>';
    }).join('') + '</nav>';
  }

  function actionsHtml(inner) {
    return '<div class="dock-actions">' + inner + '</div>';
  }

  function renderDock(route) {
    const dock = document.getElementById('dock');
    if (route.name === 'cards') {
      const deck = findDeck(route.deckId);
      dock.hidden = false;
      if (!deck) {
        dock.innerHTML = tabs(route);
        return;
      }
      const index = deckIndex(store.load(), deck);
      dock.innerHTML = index >= deck.cards.length
        ? actionsHtml('<button type="button" class="btn btn-gray" data-action="cards-restart" data-deck="' + deck.id + '">Otra vez</button><button type="button" class="btn btn-fill" data-action="open-quiz" data-deck="' + deck.id + '">Práctica</button>')
        : actionsHtml('<button type="button" class="btn btn-gray" data-action="rate" data-known="0">Aún no</button><button type="button" class="btn btn-fill" data-action="rate" data-known="1">La sé</button>');
      return;
    }
    if (route.name === 'quiz' && memory.quiz && memory.quiz.deckId === route.deckId && memory.quiz.phase !== 'result') {
      const quiz = memory.quiz;
      if (quiz.phase === 'answered') {
        dock.hidden = false;
        dock.innerHTML = actionsHtml('<button type="button" class="btn btn-fill" data-action="next-q">Siguiente</button>');
        return;
      }
      if (quiz.mode === 'type') {
        dock.hidden = false;
        dock.innerHTML = actionsHtml('<button type="button" class="btn btn-fill" data-action="check-typed">Comprobar</button>');
        return;
      }
      dock.hidden = true;
      dock.innerHTML = '';
      return;
    }
    dock.hidden = false;
    dock.innerHTML = tabs(route);
  }

  function remember(route) {
    if (route.name === 'letter' && findLetter(route.id)) {
      store.update(function (state) {
        state.seenLetters[route.id] = true;
        state.lastPlace = { type: 'letter', letterId: route.id };
        store.markStudy(state);
      });
    }
    if ((route.name === 'deck' || route.name === 'cards' || route.name === 'quiz') && findDeck(route.deckId)) {
      const mode = route.name === 'deck' ? 'deck' : route.name;
      store.update(function (state) {
        state.lastPlace = { type: 'deck', deckId: route.deckId, mode: mode };
      });
    }
  }

  let lastHash = null;

  function render() {
    speech.cancel();
    const route = parseRoute();
    remember(route);
    const main = document.getElementById('main');
    const prevScroll = main.scrollTop;
    const same = location.hash === lastHash;
    main.innerHTML = view(route);
    renderDock(route);
    document.title = titleFor(route) + ' · Estudio Ruso';
    if (same) main.scrollTop = prevScroll;
    else main.scrollTop = 0;
    lastHash = location.hash;
    const barEl = main.querySelector('.toolbar');
    if (barEl && !barEl.classList.contains('is-pushed')) {
      barEl.classList.toggle('is-compact', main.scrollTop > 36);
    }
    refreshOfflineNote();
  }

  function refreshOfflineNote() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then(function (reg) {
      const node = document.querySelector('.sw-status');
      if (!node) return;
      node.textContent = reg
        ? 'La copia sin conexión está lista en este navegador.'
        : 'Ábrela con conexión una vez para poder usarla sin red.';
    }).catch(function () {});
  }

  function doFlip() {
    const inner = document.querySelector('[data-action="flip"]');
    if (!inner) return;
    memory.flipped = !memory.flipped;
    inner.classList.toggle('is-flipped', memory.flipped);
    inner.setAttribute('aria-pressed', String(memory.flipped));
    inner.setAttribute('aria-label', memory.flipped ? inner.dataset.backLabel : inner.dataset.frontLabel);
  }

  function openQuiz(deckId, fresh) {
    if (fresh || !(memory.quiz && memory.quiz.deckId === deckId && memory.quiz.phase !== 'result')) {
      memory.quiz = null;
    }
    go('#/mazos/' + deckId + '/practica');
  }

  function grade(isCorrect, given) {
    const route = parseRoute();
    const deck = findDeck(route.deckId);
    const quiz = memory.quiz;
    if (!deck || !quiz || quiz.phase === 'answered' || quiz.phase === 'result') return;
    const card = currentQuizCard(deck, quiz);
    quiz.phase = 'answered';
    quiz.correct = isCorrect;
    quiz.given = given || '';
    if (isCorrect) quiz.score += 1;
    else if (quiz.missed.indexOf(card.id) === -1) quiz.missed.push(card.id);
    store.update(function (state) {
      state.quizAnswered += 1;
      if (isCorrect) {
        state.quizCorrect += 1;
        state.known[card.id] = true;
      } else {
        delete state.known[card.id];
      }
      state.lastPlace = { type: 'deck', deckId: deck.id, mode: 'quiz' };
      store.markStudy(state);
    });
    render();
  }

  function gradeTyped() {
    const quiz = memory.quiz;
    const route = parseRoute();
    const deck = findDeck(route.deckId);
    if (!quiz || !deck) return;
    const input = document.getElementById('answer');
    const value = input ? input.value : '';
    if (!String(value).trim()) {
      const note = document.querySelector('.field-hint');
      if (note) note.textContent = 'Escribe una respuesta para comprobarla.';
      if (input) input.focus();
      return;
    }
    const card = currentQuizCard(deck, quiz);
    const side = quiz.direction === 'ru-es' ? 'es' : 'ru';
    grade(text.matchesAny(value, text.answersFor(card, side)), value);
  }

  function nextQuestion() {
    const quiz = memory.quiz;
    if (!quiz || quiz.phase !== 'answered') return;
    quiz.index += 1;
    quiz.phase = 'ask';
    quiz.correct = null;
    quiz.given = '';
    quiz.picked = null;
    if (quiz.index >= quiz.order.length) {
      quiz.phase = 'result';
      store.update(function (state) { state.quizzes += 1; });
    }
    render();
  }

  function rate(known) {
    const route = parseRoute();
    const deck = findDeck(route.deckId);
    if (!deck) return;
    const index = deckIndex(store.load(), deck);
    if (index >= deck.cards.length) return;
    const card = deck.cards[index];
    memory.flipped = false;
    store.update(function (state) {
      if (known) state.known[card.id] = true;
      else delete state.known[card.id];
      state.reviews += 1;
      const prev = state.deckState[deck.id] || {};
      state.deckState[deck.id] = Object.assign({}, prev, { index: index + 1 });
      state.lastPlace = { type: 'deck', deckId: deck.id, mode: 'cards' };
      store.markStudy(state);
    });
    render();
  }

  function move(delta) {
    const route = parseRoute();
    const deck = findDeck(route.deckId);
    if (!deck || route.name !== 'cards') return;
    const index = deckIndex(store.load(), deck);
    const next = Math.max(0, Math.min(deck.cards.length, index + delta));
    memory.flipped = false;
    store.update(function (state) {
      const prev = state.deckState[deck.id] || {};
      state.deckState[deck.id] = Object.assign({}, prev, { index: next });
    });
    render();
  }

  function openSheet() {
    const sheet = document.getElementById('sheet');
    sheet.hidden = false;
    document.getElementById('app').setAttribute('inert', '');
    const cancel = sheet.querySelector('[data-action="close-sheet"]');
    if (cancel) cancel.focus();
  }

  function closeSheet() {
    const sheet = document.getElementById('sheet');
    sheet.hidden = true;
    document.getElementById('app').removeAttribute('inert');
    const opener = document.querySelector('[data-action="open-reset"]');
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (event) {
    const sheet = document.getElementById('sheet');
    if (!sheet.hidden && event.target === sheet) {
      closeSheet();
      return;
    }
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'flip') {
      doFlip();
      return;
    }
    if (action === 'speak') {
      const ok = speech.speak(el.dataset.text || '');
      if (!ok) {
        const note = document.querySelector('.speech-note');
        if (note) note.textContent = 'No se ha podido leer en voz alta. Usa la pronunciación escrita.';
      }
      return;
    }
    if (action === 'filter') {
      memory.letterFilter = el.dataset.filter;
      render();
      return;
    }
    if (action === 'pref') {
      const patch = {};
      patch[el.dataset.key] = el.dataset.value;
      setDeckPref(el.dataset.deck, patch);
      return;
    }
    if (action === 'jump') {
      event.preventDefault();
      memory.flipped = false;
      store.update(function (state) {
        const prev = state.deckState[el.dataset.deck] || {};
        state.deckState[el.dataset.deck] = Object.assign({}, prev, { index: Number(el.dataset.index) || 0 });
      });
      go('#/mazos/' + el.dataset.deck + '/tarjetas');
      return;
    }
    if (action === 'open-quiz') {
      event.preventDefault();
      openQuiz(el.dataset.deck, false);
      return;
    }
    if (action === 'restart-quiz') {
      event.preventDefault();
      openQuiz(el.dataset.deck, true);
      return;
    }
    if (action === 'rate') {
      rate(el.dataset.known === '1');
      return;
    }
    if (action === 'move') {
      move(Number(el.dataset.delta) || 0);
      return;
    }
    if (action === 'cards-restart') {
      memory.flipped = false;
      store.update(function (state) {
        const prev = state.deckState[el.dataset.deck] || {};
        state.deckState[el.dataset.deck] = Object.assign({}, prev, { index: 0 });
      });
      render();
      return;
    }
    if (action === 'pick') {
      const quiz = memory.quiz;
      const deck = findDeck(parseRoute().deckId);
      if (!quiz || !deck || quiz.phase !== 'ask') return;
      quiz.picked = el.dataset.id;
      grade(el.dataset.id === currentQuizCard(deck, quiz).id, '');
      return;
    }
    if (action === 'check-typed') {
      gradeTyped();
      return;
    }
    if (action === 'next-q') {
      nextQuestion();
      return;
    }
    if (action === 'theme') {
      store.update(function (state) { state.theme = el.dataset.theme; });
      applyTheme(el.dataset.theme);
      document.querySelectorAll('[data-action="theme"]').forEach(function (button) {
        button.setAttribute('aria-checked', String(button.dataset.theme === el.dataset.theme));
      });
      return;
    }
    if (action === 'open-reset') openSheet();
    if (action === 'close-sheet') closeSheet();
    if (action === 'confirm-reset') {
      store.reset();
      memory.quiz = null;
      memory.flipped = false;
      closeSheet();
      render();
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.id !== 'quiz-form') return;
    event.preventDefault();
    gradeTyped();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !document.getElementById('sheet').hidden) {
      closeSheet();
      return;
    }
    if (event.target.closest('input, textarea, a, summary')) return;
    const route = parseRoute();
    if ((event.key === ' ' || event.key === 'Enter') && event.target.closest('[data-action="flip"]')) {
      event.preventDefault();
      doFlip();
      return;
    }
    if (event.target.closest('button')) return;
    if (route.name === 'cards' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  document.addEventListener('focusin', function (event) {
  if (event.target.id !== 'answer') return;
  window.setTimeout(function () {
    event.target.scrollIntoView({ block: 'center' });
  }, 280);
});

document.getElementById('main').addEventListener('scroll', function () {
    const barEl = document.querySelector('#main .toolbar');
    const main = document.getElementById('main');
    if (!barEl || barEl.classList.contains('is-pushed')) return;
    barEl.classList.toggle('is-compact', main.scrollTop > 36);
  }, { passive: true });

  function init() {
    applyTheme(store.load().theme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if ((store.load().theme || 'system') === 'system') applyTheme('system');
    });
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }
    window.addEventListener('hashchange', render);
    if (!location.hash || location.hash === '#') location.replace('#/');
    else render();
  }

  init();
})();
