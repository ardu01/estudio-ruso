(function (root) {
  function fold(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zа-я0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compact(value) {
    return fold(value).replace(/\s/g, '');
  }

  function sameAnswer(input, expected) {
    const given = fold(input);
    const wanted = fold(expected);
    if (!given || !wanted) return false;
    if (given === wanted) return true;
    const a = given.replace(/\s/g, '');
    const b = wanted.replace(/\s/g, '');
    return a.length > 0 && a === b;
  }

  function splitLoose(text) {
    const raw = String(text || '').trim();
    if (!raw) return [];
    const parts = raw.split('/').map(function (part) { return part.trim(); }).filter(Boolean);
    return [raw].concat(parts);
  }

  function latinLoose(latin) {
    const base = String(latin || '').trim();
    if (!base) return [];
    const variants = [base, base.replace(/yy/g, 'y'), base.replace(/iy/g, 'i')];
    return variants.filter(function (item, index) {
      return item && variants.indexOf(item) === index;
    });
  }

  function answersFor(card, side) {
    const list = [];
    if (!card) return list;
    if (side === 'es') {
      splitLoose(card.es).forEach(function (item) { list.push(item); });
      (card.aliasesEs || []).forEach(function (item) { list.push(item); });
    } else {
      [card.ru, card.tr, card.latin].forEach(function (item) {
        if (item) list.push(item);
      });
      latinLoose(card.latin).forEach(function (item) { list.push(item); });
      (card.aliasesRu || []).forEach(function (item) { list.push(item); });
    }
    if (card.digit != null) list.push(String(card.digit));
    return list;
  }

  function matchesAny(input, expectedList) {
    return expectedList.some(function (item) { return sameAnswer(input, item); });
  }

  function shuffle(list, rng) {
    const random = rng || Math.random;
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function sideText(card, side) {
    return side === 'es' ? card.es : card.ru;
  }

  function buildChoices(cards, correct, side, rng) {
    const pool = shuffle(cards.filter(function (card) { return card.id !== correct.id; }), rng);
    const picked = [];
    const correctText = fold(sideText(correct, side));
    pool.some(function (card) {
      const text = fold(sideText(card, side));
      if (!text || text === correctText) return false;
      if (picked.some(function (item) { return fold(sideText(item, side)) === text; })) return false;
      picked.push(card);
      return picked.length === 3;
    });
    return shuffle(picked.concat([correct]), rng);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  root.RusoText = {
    fold: fold,
    compact: compact,
    sameAnswer: sameAnswer,
    answersFor: answersFor,
    matchesAny: matchesAny,
    shuffle: shuffle,
    buildChoices: buildChoices,
    esc: esc
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
