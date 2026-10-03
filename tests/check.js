const fs = require('fs');
const vm = require('vm');
const path = require('path');

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['js/data.js', 'js/text.js', 'js/store.js'].forEach(function (file) {
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

assert(data.decks.length === 5, 'five decks');
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

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('ok', Object.keys(cardIds).length, 'cards', data.alphabet.length, 'letters');
