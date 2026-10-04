const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['js/data.js', 'js/vocab.js', 'js/lessons.js', 'js/text.js', 'js/srs.js', 'js/cyrillic.js', 'js/store.js'].forEach(function (file) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
});

const data = sandbox.RusoData;
const text = sandbox.RusoText;
const store = sandbox.RusoStore;
let failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', message);
  }
}

assert(data.alphabet.length === 33, 'alphabet has 33 letters');
const groups = { vowel: 0, consonant: 0, sign: 0 };
const letterIds = {};
data.alphabet.forEach(function (letter) {
  groups[letter.group] += 1;
  assert(!letterIds[letter.id], 'unique letter id ' + letter.id);
  letterIds[letter.id] = true;
  assert(letter.upper && letter.lower && letter.hint && letter.note && letter.speak, 'letter fields ' + letter.id);
  assert(letter.example && letter.example.ru && letter.example.es, 'example ' + letter.id);
});
assert(groups.vowel === 10 && groups.consonant === 21 && groups.sign === 2, 'letter groups 10/21/2');

assert(data.decks.length >= 20, 'many decks');
const cardIds = {};
data.decks.forEach(function (deck) {
  assert(deck.cards.length > 0, 'deck not empty ' + deck.id);
  deck.cards.forEach(function (card) {
    assert(!cardIds[card.id], 'unique card ' + card.id);
    cardIds[card.id] = true;
    assert(card.ru && card.tr && card.latin && card.es, 'card fields ' + card.id);
    assert(/[А-Яа-яЁё]/.test(card.ru), 'cyrillic ' + card.id);
    assert(!/[<>]/.test(card.ru + card.es + card.tr + (card.note || '')), 'no html ' + card.id);
  });
});

const numbers = data.decks.find(function (deck) { return deck.id === 'numeros'; });
assert(numbers.cards.length === 20, 'numbers 1-20');
numbers.cards.forEach(function (card, index) {
  assert(card.digit === index + 1, 'digit ' + (index + 1));
});

assert(text.fold('¿Qué tal?') === 'que tal', 'fold spanish');
assert(text.fold('Ёлка') === 'елка', 'fold yo');
assert(text.sameAnswer('pri-VYET', 'pri-VYET'), 'same tr');
const privet = data.decks[0].cards[0];
assert(text.matchesAny('privet', text.answersFor(privet, 'ru')), 'latin privet');
assert(text.matchesAny('привет', text.answersFor(privet, 'ru')), 'cyrillic privet');
assert(text.matchesAny('pri-vyet', text.answersFor(privet, 'ru')), 'tr privet');
assert(text.matchesAny('hola', text.answersFor(privet, 'es')), 'es hola');
const pozhaluysta = data.decks[0].cards[9];
assert(text.matchesAny('de nada', text.answersFor(pozhaluysta, 'es')), 'split es');
assert(text.matchesAny('8', text.answersFor(numbers.cards[7], 'es')), 'digit alias');

const choices = text.buildChoices(numbers.cards, numbers.cards[0], 'es', function () { return 0; });
assert(choices.length === 4, 'four choices');
assert(choices.some(function (card) { return card.id === numbers.cards[0].id; }), 'choice includes answer');

assert(store.prevDate('2026-10-03') === '2026-10-02', 'prev day');
assert(store.prevDate('2026-03-01') === '2026-02-28', 'prev non-leap');
assert(store.prevDate('2024-03-01') === '2024-02-29', 'prev leap');
const streak = store.blank();
store.markStudy(streak, '2026-10-01');
assert(streak.streak === 1 && streak.bestStreak === 1, 'streak starts');
store.markStudy(streak, '2026-10-01');
assert(streak.streak === 1, 'same day keeps streak');
store.markStudy(streak, '2026-10-02');
assert(streak.streak === 2 && streak.bestStreak === 2, 'next day grows');
store.markStudy(streak, '2026-10-04');
assert(streak.streak === 1 && streak.bestStreak === 2, 'gap resets and keeps best');

const clean = store.sanitize({ theme: 'nope', streak: '3', known: null });
assert(clean.theme === 'system' && clean.streak === 3 && clean.known && !clean.known.a, 'sanitize');
assert(clean.v === 2 && clean.goal === 15 && clean.srs && clean.favorites, 'v2 defaults');

const migrated = store.sanitize({ v: 1, theme: 'dark', known: { 'saludos-01': true } });
assert(migrated.theme === 'dark', 'migration keeps theme');
assert(migrated.srs['saludos-01'] && migrated.srs['saludos-01'].reps === 2 && migrated.srs['saludos-01'].interval === 3, 'known becomes srs');

const lessons = sandbox.RusoLessons;
const srs = sandbox.RusoSrs;
const cyr = sandbox.RusoCyr;
assert(lessons.syllables.length === 48, '48 syllables');
assert(cyr.latinToCyrillic('privet') === 'привет', 'latin privet');
assert(cyr.latinToCyrillic('chay') === 'чай', 'latin chay');
assert(cyr.latinToCyrillic('tyotya') === 'тётя', 'latin tyotya');
assert(cyr.latinToCyrillic('khorosho') === 'хорошо', 'latin khorosho');
assert(cyr.latinToCyrillic('dobryy') === 'добрый', 'latin dobryy');
assert(cyr.latinToCyrillic('ty') === 'ты', 'latin ty');
assert(cyr.latinToCyrillic('moy') === 'мой', 'latin moy');
assert(cyr.latinToCyrillic('krasnyy') === 'красный', 'latin krasnyy');

const good = srs.schedule(null, 'good', '2026-10-01');
assert(good.interval === 1 && good.due === '2026-10-02' && good.reps === 1, 'srs good');
const lapse = srs.schedule(good, 'again', '2026-10-02');
assert(lapse.reps === 0 && lapse.due === '2026-10-02', 'srs again');

const wanted = ['familia', 'comida', 'viaje', 'tiempo', 'clima', 'casa', 'cuerpo', 'animales', 'compras', 'restaurante', 'direcciones', 'emociones', 'trabajo', 'adjetivos', 'preguntas', 'pronombres', 'preposiciones'];
wanted.forEach(function (id) {
  assert(data.decks.some(function (deck) { return deck.id === id && deck.cards.length >= 8; }), 'deck ' + id);
});

lessons.path.forEach(function (step) {
  if (step.deckId) {
    assert(data.decks.some(function (deck) { return deck.id === step.deckId; }), 'path deck ' + step.deckId);
  }
});

lessons.grammar.forEach(function (lesson) {
  assert(lesson.questions.length >= 4, 'grammar questions ' + lesson.id);
  lesson.questions.forEach(function (question, index) {
    assert(question.answer >= 0 && question.answer < question.options.length, 'grammar answer ' + lesson.id + ' ' + index);
    assert(!/[<>]/.test(question.prompt + question.options.join('')), 'grammar text ' + lesson.id);
  });
});

lessons.dialogues.forEach(function (scene) {
  const blanks = scene.lines.filter(function (line) { return line.blank; });
  assert(blanks.length >= 1, 'dialogue blank ' + scene.id);
  blanks.forEach(function (line) {
    assert(line.blank.options.indexOf(line.blank.answer) >= 0, 'blank option ' + scene.id);
    assert(line.ru.indexOf(line.blank.answer) >= 0, 'blank in line ' + scene.id);
  });
});

const goalState = store.blank();
store.bumpGoal(goalState, 15);
assert(goalState.goalCount === 15 && goalState.goalStreak === 1, 'goal met');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('ok', Object.keys(cardIds).length, 'cards', data.alphabet.length, 'letters');
