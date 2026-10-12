(function (root) {
  function api() { return root.RusoAppApi; }

  function allEntries() {
    const list = [];
    api().data.decks.forEach(function (deck) {
      deck.cards.forEach(function (card, index) {
        list.push({ card: card, deck: deck, index: index });
      });
    });
    return list;
  }

  function locate(id) {
    const found = allEntries().find(function (item) { return item.card.id === id; });
    return found || null;
  }

  function repsIn(state, deckId) {
    const deck = api().data.decks.find(function (item) { return item.id === deckId; });
    if (!deck) return 0;
    return deck.cards.filter(function (card) {
      return state.srs[card.id] && state.srs[card.id].reps > 0;
    }).length;
  }

  function stepDone(step, state) {
    return root.RusoLessons.stepDone(step, state, api().data.decks);
  }

  function nextStep(state) {
    const steps = root.RusoLessons.path;
    for (let i = 0; i < steps.length; i += 1) {
      if (!stepDone(steps[i], state)) return steps[i];
    }
    return null;
  }

  function goalToday(state) {
    const today = api().store.todayKey();
    const count = state.goalDate === today ? state.goalCount : 0;
    return { count: count, target: state.goal || 15, met: count >= (state.goal || 15) };
  }

  function dueCount(state) {
    const today = api().store.todayKey();
    return Object.keys(state.srs).filter(function (id) {
      const card = state.srs[id];
      return card && card.due && card.due <= today;
    }).length;
  }

  function homeDash(state) {
    const esc = api().esc;
    const goal = goalToday(state);
    const pct = Math.min(100, Math.round((goal.count / goal.target) * 100));
    const step = nextStep(state);
    const due = dueCount(state);
    const favorites = Object.keys(state.favorites).length;
    const stepHtml = step
      ? '<a class="continue" href="' + step.href + '"><div class="kicker-row"><p class="eyebrow">Siguiente paso</p><p class="eyebrow">' + esc(step.level) + '</p></div><p class="word">' + esc(step.title) + '</p><p class="tr">' + esc(step.detail) + '</p><span class="btn btn-fill">Seguir la ruta</span></a>'
      : '<section class="continue"><p class="eyebrow">Ruta</p><p class="word">Ruta completa</p><p class="tr">Puedes seguir repasando: el orden ya está hecho.</p></section>';
    return '<section class="continue goal-card"><div class="kicker-row"><p class="eyebrow">Meta de hoy</p><p class="eyebrow">' + goal.count + ' / ' + goal.target + '</p></div>' +
      api().bar(pct) +
      '<p class="tr">' + (goal.met ? 'Meta hecha. La racha de meta suma un día.' : 'Cada repaso, acierto o letra escrita cuenta.') + '</p></section>' +
      stepHtml +
      '<h2 class="group-label">Hoy</h2><div class="group">' +
      '<a class="row" href="#/repaso"><span class="row-main"><span class="row-title">Repaso espaciado</span><span class="row-sub">' + due + ' tarjetas para hoy</span></span><span class="chev" aria-hidden="true"></span></a>' +
      '<a class="row" href="#/favoritos"><span class="row-main"><span class="row-title">Favoritas</span><span class="row-sub">' + favorites + ' guardadas</span></span><span class="chev" aria-hidden="true"></span></a>' +
      '<a class="row" href="#/ruta"><span class="row-main"><span class="row-title">Ruta completa</span><span class="row-sub">Del alfabeto a los diálogos</span></span><span class="chev" aria-hidden="true"></span></a>' +
      '</div>';
  }

  function searchBlock(query) {
    const esc = api().esc;
    const q = api().text.fold(query || '');
    if (!q) return '';
    const hits = allEntries().filter(function (item) {
      const blob = api().text.fold([item.card.ru, item.card.tr, item.card.latin, item.card.es, item.deck.title].join(' '));
      return blob.indexOf(q) >= 0;
    }).slice(0, 40);
    return '<h2 class="group-label">Resultados</h2><div class="group" id="search-results">' +
      (hits.length ? hits.map(function (item) {
        return '<a class="row" href="#/mazos/' + item.deck.id + '/tarjetas" data-action="jump" data-deck="' + item.deck.id + '" data-index="' + item.index + '"><span class="row-main"><span class="row-title" lang="ru">' + esc(item.card.ru) + '</span><span class="row-sub">' + esc(item.card.es) + ' · ' + esc(item.deck.title) + '</span></span></a>';
      }).join('') : '<div class="row static"><span class="row-title">Nada con esa búsqueda</span></div>') +
      '</div>';
  }

  function deckBrowser(state) {
    const esc = api().esc;
    const groups = [];
    const byName = {};
    api().data.decks.forEach(function (deck) {
      const name = deck.group || 'Más';
      if (!byName[name]) {
        byName[name] = { name: name, decks: [] };
        groups.push(byName[name]);
      }
      byName[name].decks.push(deck);
    });
    const lists = groups.map(function (group) {
      const rows = group.decks.map(function (deck) {
        const known = deck.cards.filter(function (card) {
          return state.known[card.id] || (state.srs[card.id] && state.srs[card.id].reps > 0);
        }).length;
        return '<a class="row has-mark" href="#/mazos/' + deck.id + '"><span class="mark" lang="ru">' + esc(deck.glyph) + '</span><span class="row-main"><span class="row-title">' + esc(deck.title) + '</span><span class="row-sub">' + deck.cards.length + ' · ' + known + ' en repaso</span></span><span class="chev" aria-hidden="true"></span></a>';
      }).join('');
      return '<h2 class="group-label">' + esc(group.name) + '</h2><div class="group">' + rows + '</div>';
    }).join('');
    return lists;
  }

  function renderPath() {
    const esc = api().esc;
    const state = api().store.load();
    const steps = root.RusoLessons.path;
    let html = '';
    let level = '';
    let open = '';
    steps.forEach(function (step, index) {
      if (step.level !== level) {
        if (open) html += '</div>';
        level = step.level;
        html += '<h2 class="group-label">' + esc(level) + '</h2><div class="group">';
        open = level;
      }
      const done = stepDone(step, state);
      html += '<a class="row has-mark" href="' + step.href + '"><span class="mark">' + (index + 1) + '</span><span class="row-main"><span class="row-title">' + esc(step.title) + '</span><span class="row-sub">' + esc(step.detail) + '</span></span>' +
        (done ? '<span class="tick" aria-label="Hecho">✓</span>' : '<span class="chev" aria-hidden="true"></span>') + '</a>';
    });
    if (open) html += '</div>';
    const doneCount = steps.filter(function (step) { return stepDone(step, state); }).length;
    return api().shell({
      title: 'Ruta',
      large: 'Ruta',
      sub: doneCount + ' de ' + steps.length + ' pasos',
      body: '<p class="alias">El orden es una sugerencia. Puedes abrir cualquier paso.</p>' + html
    });
  }

  function renderSyllables() {
    const esc = api().esc;
    const filter = api().memory.syllableFilter || 'а';
    const vowels = ['а', 'о', 'у', 'и'];
    const segmented = '<div class="inset"><div class="segmented" role="radiogroup" aria-label="Vocal">' +
      vowels.map(function (vowel) {
        return '<button type="button" role="radio" aria-checked="' + (filter === vowel) + '" data-action="syl-filter" data-vowel="' + vowel + '">' + vowel + '</button>';
      }).join('') + '</div></div>';
    const cells = root.RusoLessons.syllables.filter(function (item) { return item.vowel === filter; }).map(function (item) {
      return '<button type="button" class="letter" data-action="speak" data-text="' + esc(item.ru) + '"><span class="ru" lang="ru"><b>' + esc(item.ru) + '</b></span><span class="ph">' + esc(item.tr) + '</span></button>';
    }).join('');
    return api().shell({
      title: 'Sílabas',
      large: 'Sílabas',
      sub: 'Toca para oír. Luego practica.',
      body: segmented + '<div class="letters">' + cells + '</div><div class="inset"><a class="btn btn-fill" style="width:100%" href="#/silabas/practica">Practicar 10</a></div>'
    });
  }

  function ensureSyllableQuiz() {
    const memory = api().memory;
    if (memory.syllable && memory.syllable.phase !== 'need') return memory.syllable;
    const ids = api().text.shuffle(root.RusoLessons.syllables.map(function (item) { return item.id; })).slice(0, 10);
    memory.syllable = { ids: ids, index: 0, score: 0, phase: 'ask', picked: null };
    return memory.syllable;
  }

  function renderSyllableQuiz() {
    const esc = api().esc;
    const quiz = ensureSyllableQuiz();
    if (quiz.phase === 'result') {
      const ok = quiz.score >= 7;
      if (ok && !quiz.credited) {
        quiz.credited = true;
        api().store.update(function (state) {
          state.pathDone.silabas = true;
          api().store.markStudy(state);
        });
      }
      return api().shell({
        pushed: true,
        back: '#/silabas',
        title: 'Sílabas',
        body: '<section class="quiz-card"><p class="score">' + quiz.score + '<span>/10</span></p><p class="result-copy">' + (ok ? 'Las sílabas ya cuentan en la ruta.' : 'Con 7 de 10 se marca el paso. Puedes repetir.') + '</p><div class="stack"><button type="button" class="btn btn-fill" data-action="syl-restart">Otra vez</button></div></section>'
      });
    }
    const current = root.RusoLessons.syllables.find(function (item) { return item.id === quiz.ids[quiz.index]; });
    const options = api().text.buildChoices(root.RusoLessons.syllables.map(function (item) {
      return { id: item.id, ru: item.ru, es: item.tr };
    }), { id: current.id, ru: current.ru, es: current.tr }, 'ru');
    const locked = quiz.phase === 'answered';
    const choices = '<div class="group">' + options.map(function (item) {
      const syl = root.RusoLessons.syllables.find(function (row) { return row.id === item.id; });
      let cls = 'option';
      if (locked && item.id === current.id) cls += ' is-correct';
      if (locked && quiz.picked === item.id && item.id !== current.id) cls += ' is-wrong';
      return '<button type="button" class="' + cls + '" data-action="syl-pick" data-id="' + esc(item.id) + '"' + (locked ? ' disabled' : '') + ' lang="ru">' + esc(syl.ru) + '</button>';
    }).join('') + '</div>';
    return api().shell({
      pushed: true,
      back: '#/silabas',
      title: 'Sílabas',
      body: '<div class="card-tools"><span></span><p>' + (quiz.index + 1) + ' de 10</p></div><section class="quiz-card"><p class="eyebrow">Elige el cirílico</p><p class="prompt">' + esc(current.tr) + '</p></section>' + choices
    });
  }

  function findGrammar(id) {
    return root.RusoLessons.grammar.find(function (item) { return item.id === id; }) || null;
  }

  function renderGrammar(route) {
    const esc = api().esc;
    const lesson = findGrammar(route.id);
    if (!lesson) return null;
    const memory = api().memory;
    if (!memory.grammar || memory.grammar.id !== lesson.id) {
      memory.grammar = { id: lesson.id, index: 0, score: 0, phase: 'read', picked: null };
    }
    const quiz = memory.grammar;
    const examples = '<h2 class="group-label">Ejemplos</h2><div class="group">' + lesson.examples.map(function (row) {
      return '<div class="row static"><span class="row-main"><span class="row-title" lang="ru">' + esc(row[0]) + '</span><span class="row-sub">' + esc(row[1]) + ' · ' + esc(row[2]) + '</span></span></div>';
    }).join('') + '</div>';
    const text = lesson.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    let practice = '';
    if (quiz.phase === 'done') {
      const passed = quiz.score >= 3;
      if (passed && !quiz.credited) {
        quiz.credited = true;
        api().store.update(function (state) {
          if (!state.pathDone[lesson.id]) {
            state.pathDone[lesson.id] = true;
            api().store.bumpGoal(state, 1);
            api().store.markStudy(state);
          }
        });
      }
      practice = '<section class="quiz-card"><p class="score">' + quiz.score + '<span>/' + lesson.questions.length + '</span></p><p class="result-copy">' + (passed ? 'Paso marcado en la ruta.' : 'Hacen falta 3 aciertos para marcarlo.') + '</p><button type="button" class="btn btn-fill" data-action="gram-restart">Repetir preguntas</button></section>';
    } else if (quiz.phase === 'ask' || quiz.phase === 'answered') {
      const question = lesson.questions[quiz.index];
      const locked = quiz.phase === 'answered';
      practice = '<h2 class="group-label">Pregunta ' + (quiz.index + 1) + ' de ' + lesson.questions.length + '</h2><section class="quiz-card"><p class="prompt" style="font-size:22px">' + esc(question.prompt) + '</p></section><div class="group">' +
        question.options.map(function (option, index) {
          let cls = 'option';
          if (locked && index === question.answer) cls += ' is-correct';
          if (locked && quiz.picked === index && index !== question.answer) cls += ' is-wrong';
          return '<button type="button" class="' + cls + '" data-action="gram-pick" data-index="' + index + '"' + (locked ? ' disabled' : '') + '>' + esc(option) + '</button>';
        }).join('') + '</div>';
    }
    const start = quiz.phase === 'read'
      ? '<div class="inset"><button type="button" class="btn btn-fill" style="width:100%" data-action="gram-start">Comprobar</button></div>'
      : '';
    return api().shell({
      pushed: true,
      back: '#/ruta',
      title: lesson.title,
      body: '<div class="group" style="margin-top:12px"><div class="about">' + text + '</div></div>' + examples + start + practice
    });
  }

  function renderDialogues() {
    const esc = api().esc;
    const state = api().store.load();
    const rows = root.RusoLessons.dialogues.map(function (item) {
      const done = state.pathDone['dlg-' + item.id];
      return '<a class="row" href="#/dialogos/' + item.id + '"><span class="row-main"><span class="row-title">' + esc(item.title) + '</span><span class="row-sub">' + esc(item.blurb) + '</span></span>' +
        (done ? '<span class="tick" aria-label="Hecho">✓</span>' : '<span class="chev" aria-hidden="true"></span>') + '</a>';
    }).join('');
    return api().shell({
      title: 'Diálogos',
      large: 'Diálogos',
      sub: 'Escenas cortas con un hueco',
      body: '<div class="group">' + rows + '</div>'
    });
  }

  function renderDialogue(route) {
    const esc = api().esc;
    const scene = root.RusoLessons.dialogues.find(function (item) { return item.id === route.id; });
    if (!scene) return null;
    const memory = api().memory;
    if (!memory.dialogue || memory.dialogue.id !== scene.id) {
      memory.dialogue = { id: scene.id, picked: null, phase: 'ask', solved: {} };
    }
    const dlg = memory.dialogue;
    const lines = scene.lines.map(function (line, index) {
      let body = esc(line.ru);
      if (line.blank && !dlg.solved[index]) {
        body = esc(line.ru.replace(line.blank.answer, '___'));
      }
      return '<div class="row static"><span class="row-main"><span class="row-sub">' + esc(line.speaker) + '</span><span class="row-title" lang="ru">' + body + '</span><span class="row-sub">' + esc(line.tr) + ' · ' + esc(line.es) + '</span></span></div>';
    }).join('');
    const blankIndex = scene.lines.findIndex(function (line, index) { return line.blank && !dlg.solved[index]; });
    let practice = '';
    if (blankIndex === -1) {
      if (!dlg.credited) {
        dlg.credited = true;
        api().store.update(function (state) {
          const key = 'dlg-' + scene.id;
          if (!state.pathDone[key]) {
            state.pathDone[key] = true;
            const count = root.RusoLessons.dialogues.filter(function (item) { return state.pathDone['dlg-' + item.id]; }).length;
            if (count >= 2) state.pathDone.dialogos = true;
            api().store.bumpGoal(state, 1);
            api().store.markStudy(state);
          }
        });
      }
      practice = '<section class="quiz-card"><p class="result-copy">Escena completa.</p><a class="btn btn-fill" href="#/dialogos">Volver a los diálogos</a></section>';
    } else {
      const blank = scene.lines[blankIndex].blank;
      practice = '<h2 class="group-label">Completa</h2><div class="group">' + blank.options.map(function (option) {
        let cls = 'option';
        if (dlg.picked === option && option !== blank.answer && dlg.wrongLine === blankIndex) cls += ' is-wrong';
        return '<button type="button" class="' + cls + '" lang="ru" data-action="dlg-pick" data-line="' + blankIndex + '" data-option="' + esc(option) + '">' + esc(option) + '</button>';
      }).join('') + '</div>';
    }
    return api().shell({
      pushed: true,
      back: '#/dialogos',
      title: scene.title,
      body: '<div class="group" style="margin-top:12px">' + lines + '</div>' + practice
    });
  }

  function buildQueue(deckId) {
    const state = api().store.load();
    const today = api().store.todayKey();
    const pool = allEntries().filter(function (item) { return !deckId || item.deck.id === deckId; });
    const due = [];
    const fresh = [];
    pool.forEach(function (item) {
      const card = state.srs[item.card.id];
      if (card && card.due && card.due <= today) due.push(item.card.id);
      else if (!card) fresh.push(item.card.id);
    });
    const used = state.newDate === today ? state.newCount : 0;
    const room = Math.max(0, 10 - used);
    return due.concat(fresh.slice(0, room)).slice(0, 20);
  }

  function renderReview() {
    const state = api().store.load();
    const due = dueCount(state);
    const queue = buildQueue(null);
    return api().shell({
      title: 'Repaso',
      large: 'Repaso',
      sub: 'Lo que toca hoy, no todo el archivo',
      body: '<section class="continue"><p class="eyebrow">Pendientes</p><p class="word">' + due + '</p><p class="tr">Más hasta 10 palabras nuevas al día. El resto espera.</p><button type="button" class="btn btn-fill" data-action="start-review"' + (queue.length ? '' : ' disabled') + '>Empezar (' + queue.length + ')</button></section>' +
        '<div class="group"><a class="row" href="#/favoritos"><span class="row-main"><span class="row-title">Favoritas</span><span class="row-sub">' + Object.keys(state.favorites).length + ' palabras</span></span><span class="chev" aria-hidden="true"></span></a></div>' +
        '<p class="alias">Otra vez vuelve hoy. Bien pasa a mañana y luego a unos días. Fácil alarga más el plazo.</p>'
    });
  }

  function ensureReview() {
    const memory = api().memory;
    if (!memory.review || !memory.review.ids) {
      memory.review = { ids: buildQueue(null), index: 0, revealed: false };
    }
    return memory.review;
  }

  function renderReviewSession() {
    const esc = api().esc;
    const session = ensureReview();
    if (!session.ids.length || session.index >= session.ids.length) {
      return api().shell({
        pushed: true,
        back: '#/repaso',
        title: 'Repaso',
        body: '<section class="finished"><h2>Sesión lista</h2><p class="result-copy">No queda nada en la cola de hoy. Mañana vuelven las que marcaste como Otra vez, y más adelante las que iban bien.</p><a class="btn btn-fill" href="#/repaso">Volver</a></section>'
      });
    }
    const found = locate(session.ids[session.index]);
    if (!found) return api().shell({ pushed: true, back: '#/repaso', title: 'Repaso', body: '<p class="alias">Esa tarjeta ya no está.</p>' });
    const card = found.card;
    const back = session.revealed
      ? '<p class="word">' + esc(card.es) + '</p><p class="tr">' + esc(card.tr) + '</p>' + (card.note ? '<p class="note">' + esc(card.note) + '</p>' : '')
      : '<p class="hint">Toca para ver el español</p>';
    return api().shell({
      pushed: true,
      back: '#/repaso',
      title: 'Repaso',
      body: '<div class="card-tools"><span></span><p>' + (session.index + 1) + ' de ' + session.ids.length + '</p></div>' +
        '<div class="flip"><div class="flip-inner' + (session.revealed ? ' is-flipped' : '') + '" data-action="review-reveal" role="button" tabindex="0"><div class="face face-front" aria-hidden="true"><p class="kicker">' + esc(found.deck.title) + '</p><p class="word" lang="ru">' + esc(card.ru) + '</p><p class="tr">' + esc(card.tr) + '</p><p class="hint">Toca para el español</p></div><div class="face face-back" aria-hidden="true"><p class="kicker">Español</p>' + back + '</div></div></div>' +
        '<button type="button" class="listen" data-action="speak" data-text="' + esc(card.ru) + '">' + api().icon('speaker') + 'Escuchar</button>'
    });
  }

  function renderFavorites() {
    const esc = api().esc;
    const state = api().store.load();
    const ids = Object.keys(state.favorites);
    const rows = ids.map(function (id) {
      const found = locate(id);
      if (!found) return '';
      return '<div class="row"><a class="row-main" href="#/mazos/' + found.deck.id + '/tarjetas" data-action="jump" data-deck="' + found.deck.id + '" data-index="' + found.index + '"><span class="row-title" lang="ru">' + esc(found.card.ru) + '</span><span class="row-sub">' + esc(found.card.es) + '</span></a><button type="button" class="star is-on" data-action="star" data-id="' + esc(id) + '" aria-label="Quitar de favoritas">★</button></div>';
    }).join('');
    return api().shell({
      title: 'Favoritas',
      large: 'Favoritas',
      sub: ids.length ? ids.length + ' palabras' : 'Aún no hay',
      body: ids.length ? '<div class="group">' + rows + '</div>' : '<section class="finished"><p class="result-copy">En una tarjeta, la estrella la guarda aquí.</p></section>'
    });
  }

  function ensureListen(deck) {
    const memory = api().memory;
    if (!memory.listen || memory.listen.deckId !== deck.id) {
      const ids = api().text.shuffle(deck.cards.map(function (card) { return card.id; })).slice(0, Math.min(8, deck.cards.length));
      memory.listen = { deckId: deck.id, ids: ids, index: 0, score: 0, phase: 'ask', picked: null, showTr: !api().speech.supported() };
    }
    return memory.listen;
  }

  function renderListen(route) {
    const esc = api().esc;
    const deck = api().findDeck(route.deckId);
    if (!deck) return null;
    const quiz = ensureListen(deck);
    if (quiz.phase === 'result') {
      return api().shell({
        pushed: true,
        back: '#/mazos/' + deck.id,
        title: 'Escuchar',
        body: '<section class="quiz-card"><p class="eyebrow">' + esc(deck.title) + '</p><p class="score">' + quiz.score + '<span>/' + quiz.ids.length + '</span></p><p class="result-copy">Cada acierto entra en el repaso.</p><button type="button" class="btn btn-fill" data-action="listen-restart" data-deck="' + deck.id + '">Otra vez</button></section>'
      });
    }
    const card = deck.cards.find(function (item) { return item.id === quiz.ids[quiz.index]; });
    const sideCards = deck.cards.map(function (item) { return item; });
    const options = api().text.buildChoices(sideCards, card, 'es');
    const locked = quiz.phase === 'answered';
    const choices = '<div class="group">' + options.map(function (item) {
      let cls = 'option';
      if (locked && item.id === card.id) cls += ' is-correct';
      if (locked && quiz.picked === item.id && item.id !== card.id) cls += ' is-wrong';
      return '<button type="button" class="' + cls + '" data-action="listen-pick" data-id="' + esc(item.id) + '"' + (locked ? ' disabled' : '') + '>' + esc(item.es) + '</button>';
    }).join('') + '</div>';
    const tr = quiz.showTr ? '<p class="tr">' + esc(card.tr) + '</p>' : '<button type="button" class="linkish" data-action="show-tr">No lo distingo</button>';
    return api().shell({
      pushed: true,
      back: '#/mazos/' + deck.id,
      title: 'Escuchar',
      body: '<div class="card-tools"><span></span><p>' + (quiz.index + 1) + ' de ' + quiz.ids.length + '</p></div><section class="quiz-card"><p class="eyebrow">' + esc(deck.title) + '</p><p class="prompt" lang="ru">' + (quiz.showTr ? esc(card.ru) : '¿Qué oyes?') + '</p>' + tr +
        '<button type="button" class="listen" data-action="speak" data-text="' + esc(card.ru) + '">' + api().icon('speaker') + 'Oír</button><p class="speech-note">' + (api().speech.supported() ? 'Pulsa Oír y elige el significado.' : 'Sin voz: usa la pronunciación escrita.') + '</p></section>' + choices
    });
  }

  function ensureWrite(deck) {
    const memory = api().memory;
    if (!memory.write || memory.write.deckId !== deck.id) {
      const ids = api().text.shuffle(deck.cards.map(function (card) { return card.id; })).slice(0, Math.min(8, deck.cards.length));
      memory.write = { deckId: deck.id, ids: ids, index: 0, score: 0, value: '', phase: 'ask', given: '' };
    }
    return memory.write;
  }

  function renderWrite(route) {
    const esc = api().esc;
    const deck = api().findDeck(route.deckId);
    if (!deck) return null;
    const quiz = ensureWrite(deck);
    if (quiz.phase === 'result') {
      return api().shell({
        pushed: true,
        back: '#/mazos/' + deck.id,
        title: 'Escribir',
        body: '<section class="quiz-card"><p class="score">' + quiz.score + '<span>/' + quiz.ids.length + '</span></p><p class="result-copy">El teclado escribe cirílico. La ayuda latina es aproximada.</p><button type="button" class="btn btn-fill" data-action="write-restart" data-deck="' + deck.id + '">Otra vez</button></section>'
      });
    }
    const card = deck.cards.find(function (item) { return item.id === quiz.ids[quiz.index]; });
    const feedback = quiz.phase === 'answered'
      ? '<div class="feedback ' + (quiz.correct ? 'is-good' : 'is-bad') + '" role="status"><strong>' + (quiz.correct ? 'Correcto' : 'No era esa') + '</strong><p lang="ru">' + esc(card.ru) + '</p><p>' + esc(card.tr) + '</p></div>'
      : '';
    return api().shell({
      pushed: true,
      back: '#/mazos/' + deck.id,
      title: 'Escribir',
      body: '<div class="card-tools"><span></span><p>' + (quiz.index + 1) + ' de ' + quiz.ids.length + '</p></div><section class="quiz-card"><p class="eyebrow">' + esc(card.es) + '</p><p class="prompt" lang="ru">' + esc(quiz.value || '…') + '</p><p class="field-hint">Pista: ' + esc(card.tr) + '</p></section>' +
        '<div class="inset"><input id="latin-help" class="field" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="O escribe en latino: privet" aria-label="Ayuda latina"><p class="field-hint">Queda en cirílico: <span id="latin-preview"></span></p><button type="button" class="linkish" data-action="convert-latin">Usar esta ayuda</button></div>' +
        root.RusoCyr.keyboardHtml() + feedback
    });
  }

  function view(route) {
    if (route.name === 'path') return renderPath();
    if (route.name === 'syllables') return renderSyllables();
    if (route.name === 'syllable-quiz') return renderSyllableQuiz();
    if (route.name === 'grammar') return renderGrammar(route);
    if (route.name === 'dialogues') return renderDialogues();
    if (route.name === 'dialogue') return renderDialogue(route);
    if (route.name === 'review') return renderReview();
    if (route.name === 'review-session') return renderReviewSession();
    if (route.name === 'favorites') return renderFavorites();
    if (route.name === 'listen') return renderListen(route);
    if (route.name === 'write') return renderWrite(route);
    return null;
  }

  function dock(route) {
    const session = api().memory.review;
    if (route.name === 'review-session' && session && session.ids && session.index < session.ids.length) {
      if (!session.revealed) return '';
      return '<div class="dock-actions dock-three"><button type="button" class="btn btn-gray" data-action="srs" data-grade="again">Otra vez</button><button type="button" class="btn btn-fill" data-action="srs" data-grade="good">Bien</button><button type="button" class="btn btn-gray" data-action="srs" data-grade="easy">Fácil</button></div>';
    }
    if (route.name === 'write') {
      const deck = api().findDeck(route.deckId);
      const quiz = api().memory.write;
      if (!deck || !quiz || quiz.deckId !== deck.id || quiz.phase === 'result') return null;
      if (quiz.phase === 'answered') return '<div class="dock-actions"><button type="button" class="btn btn-fill" data-action="write-next">Siguiente</button></div>';
      return '<div class="dock-actions"><button type="button" class="btn btn-fill" data-action="write-check">Comprobar</button></div>';
    }
    if (route.name === 'listen') {
      const quiz = api().memory.listen;
      if (quiz && quiz.phase === 'answered') return '<div class="dock-actions"><button type="button" class="btn btn-fill" data-action="listen-next">Siguiente</button></div>';
      return '';
    }
    if (route.name === 'syllable-quiz') {
      const quiz = api().memory.syllable;
      if (quiz && quiz.phase === 'answered') return '<div class="dock-actions"><button type="button" class="btn btn-fill" data-action="syl-next">Siguiente</button></div>';
      return '';
    }
    if (route.name === 'grammar') {
      const quiz = api().memory.grammar;
      if (quiz && quiz.phase === 'answered') return '<div class="dock-actions"><button type="button" class="btn btn-fill" data-action="gram-next">Siguiente</button></div>';
    }
    return null;
  }

  function applySchedule(cardId, grade) {
    const store = api().store;
    const srs = api().srs;
    let label = '';
    store.update(function (state) {
      const today = store.todayKey();
      const prev = state.srs[cardId];
      const isNew = !prev;
      const next = srs.schedule(prev, grade, today);
      state.srs[cardId] = next;
      label = srs.dueLabel(next.interval);
      if (grade === 'again') delete state.known[cardId];
      else state.known[cardId] = true;
      state.reviews += 1;
      store.bumpGoal(state, 1);
      store.markStudy(state);
      if (isNew) {
        if (state.newDate !== today) {
          state.newDate = today;
          state.newCount = 0;
        }
        state.newCount += 1;
      }
    });
    return label;
  }

  function handle(action, el) {
    const memory = api().memory;
    const store = api().store;
    if (action === 'syl-filter') {
      memory.syllableFilter = el.dataset.vowel;
      api().render();
      return true;
    }
    if (action === 'syl-pick') {
      const quiz = memory.syllable;
      if (!quiz || quiz.phase !== 'ask') return true;
      quiz.picked = el.dataset.id;
      quiz.phase = 'answered';
      if (quiz.picked === quiz.ids[quiz.index]) quiz.score += 1;
      store.update(function (state) { store.bumpGoal(state, 1); store.markStudy(state); });
      api().render();
      return true;
    }
    if (action === 'syl-next') {
      const quiz = memory.syllable;
      if (!quiz) return true;
      quiz.index += 1;
      quiz.phase = quiz.index >= quiz.ids.length ? 'result' : 'ask';
      quiz.picked = null;
      api().render();
      return true;
    }
    if (action === 'syl-restart') {
      memory.syllable = { phase: 'need' };
      api().render();
      return true;
    }
    if (action === 'gram-start') {
      if (memory.grammar) memory.grammar.phase = 'ask';
      api().render();
      return true;
    }
    if (action === 'gram-pick') {
      const quiz = memory.grammar;
      const lesson = findGrammar(quiz && quiz.id);
      if (!quiz || !lesson || quiz.phase !== 'ask') return true;
      const question = lesson.questions[quiz.index];
      quiz.picked = Number(el.dataset.index);
      quiz.phase = 'answered';
      if (quiz.picked === question.answer) quiz.score += 1;
      store.update(function (state) { store.bumpGoal(state, 1); store.markStudy(state); });
      api().render();
      return true;
    }
    if (action === 'gram-next') {
      const quiz = memory.grammar;
      const lesson = findGrammar(quiz && quiz.id);
      if (!quiz || !lesson) return true;
      quiz.index += 1;
      quiz.picked = null;
      quiz.phase = quiz.index >= lesson.questions.length ? 'done' : 'ask';
      api().render();
      return true;
    }
    if (action === 'gram-restart') {
      if (memory.grammar) {
        memory.grammar.index = 0;
        memory.grammar.score = 0;
        memory.grammar.phase = 'ask';
        memory.grammar.picked = null;
      }
      api().render();
      return true;
    }
    if (action === 'dlg-pick') {
      const scene = root.RusoLessons.dialogues.find(function (item) { return memory.dialogue && item.id === memory.dialogue.id; });
      const lineNo = Number(el.dataset.line);
      const line = scene && scene.lines[lineNo];
      if (!scene || !line || !line.blank || memory.dialogue.solved[lineNo]) return true;
      if (el.dataset.option === line.blank.answer) {
        memory.dialogue.solved[lineNo] = true;
        memory.dialogue.picked = null;
        memory.dialogue.wrongLine = null;
      } else {
        memory.dialogue.picked = el.dataset.option;
        memory.dialogue.wrongLine = lineNo;
      }
      api().render();
      return true;
    }
    if (action === 'start-review') {
      memory.review = { ids: buildQueue(null), index: 0, revealed: false };
      api().go('#/repaso/sesion');
      return true;
    }
    if (action === 'review-reveal') {
      if (memory.review) memory.review.revealed = !memory.review.revealed;
      api().render();
      return true;
    }
    if (action === 'srs') {
      const session = memory.review;
      if (!session || session.index >= session.ids.length) return true;
      const label = applySchedule(session.ids[session.index], el.dataset.grade);
      const names = { again: 'Otra vez', good: 'Bien', easy: 'Fácil' };
      memory.note = (names[el.dataset.grade] || 'Bien') + ' · ' + label;
      session.index += 1;
      session.revealed = false;
      api().render();
      return true;
    }
    if (action === 'star') {
      const id = el.dataset.id;
      store.update(function (state) {
        if (state.favorites[id]) delete state.favorites[id];
        else state.favorites[id] = true;
      });
      api().render();
      return true;
    }
    if (action === 'show-tr') {
      if (memory.listen) memory.listen.showTr = true;
      api().render();
      return true;
    }
    if (action === 'listen-pick') {
      const quiz = memory.listen;
      const deck = api().findDeck(quiz && quiz.deckId);
      if (!quiz || !deck || quiz.phase !== 'ask') return true;
      const cardId = quiz.ids[quiz.index];
      quiz.picked = el.dataset.id;
      quiz.phase = 'answered';
      const correct = quiz.picked === cardId;
      if (correct) quiz.score += 1;
      applySchedule(cardId, correct ? 'good' : 'again');
      api().render();
      return true;
    }
    if (action === 'listen-next') {
      const quiz = memory.listen;
      if (!quiz) return true;
      quiz.index += 1;
      quiz.phase = quiz.index >= quiz.ids.length ? 'result' : 'ask';
      quiz.picked = null;
      quiz.showTr = !api().speech.supported();
      api().render();
      return true;
    }
    if (action === 'listen-restart') {
      memory.listen = null;
      api().render();
      return true;
    }
    if (action === 'key') {
      const quiz = memory.write;
      if (!quiz || quiz.phase === 'answered' || quiz.phase === 'result') return true;
      if (el.dataset.key === 'back') quiz.value = quiz.value.slice(0, -1);
      else quiz.value += el.dataset.key;
      api().render();
      return true;
    }
    if (action === 'convert-latin') {
      const input = document.getElementById('latin-help');
      if (memory.write && input) {
        memory.write.value = root.RusoCyr.latinToCyrillic(input.value);
        api().render();
      }
      return true;
    }
    if (action === 'write-check') {
      const quiz = memory.write;
      const deck = api().findDeck(quiz && quiz.deckId);
      if (!quiz || !deck || quiz.phase !== 'ask') return true;
      const card = deck.cards.find(function (item) { return item.id === quiz.ids[quiz.index]; });
      if (!String(quiz.value || '').trim()) {
        const hint = document.querySelector('.field-hint');
        if (hint) hint.textContent = 'Escribe la palabra en cirílico.';
        return true;
      }
      const ok = api().text.matchesAny(quiz.value, api().text.answersFor(card, 'ru'));
      quiz.phase = 'answered';
      quiz.correct = ok;
      if (ok) quiz.score += 1;
      applySchedule(card.id, ok ? 'good' : 'again');
      api().render();
      return true;
    }
    if (action === 'write-next') {
      const quiz = memory.write;
      if (!quiz) return true;
      quiz.index += 1;
      quiz.value = '';
      quiz.phase = quiz.index >= quiz.ids.length ? 'result' : 'ask';
      quiz.correct = null;
      api().render();
      return true;
    }
    if (action === 'write-restart') {
      memory.write = null;
      api().render();
      return true;
    }
    if (action === 'goal') {
      store.update(function (state) { state.goal = Number(el.dataset.goal) || 15; });
      api().render();
      return true;
    }
    return false;
  }

  root.RusoStudy = {
    view: view,
    dock: dock,
    handle: handle,
    homeDash: homeDash,
    deckBrowser: deckBrowser,
    searchBlock: searchBlock,
    locate: locate,
    applySchedule: applySchedule,
    repsIn: repsIn,
    nextStep: nextStep
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
